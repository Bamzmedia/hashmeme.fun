'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';

/**
 * Utility to convert Uint8Array to Base64 (Standard Specification)
 */
function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Hook: useHederaSigner
 * Pure implementation to route Hedera transactions through WalletConnect bridge.
 */
export function useHederaSigner() {
    const { isConnected, address, chain, connector } = useAccount();
    const [signer, setSigner] = useState<any | null>(null);

    const executeTransaction = useCallback(async (transaction: any) => {
        if (!connector || !address) throw new Error("Wallet not connected");

        try {
            // 1. Resolve Hedera Identities and Network
            const network = chain?.id === 295 ? 'mainnet' : 'testnet';
            const hederaId = localStorage.getItem('glowswap_last_account_id');
            if (!hederaId) throw new Error("Hedera Account ID (0.0.x) not resolved.");

            // 2. Prepare Transaction using Hedera SDK logic
            const { AccountId, TransactionId } = await import('@hashgraph/sdk');
            if (!transaction.isFrozen()) {
                transaction.setTransactionId(TransactionId.generate(AccountId.fromString(hederaId)));
                transaction.setNodeAccountIds([AccountId.fromString('0.0.3')]); // Standard node
                transaction.freeze();
            }

            // 3. Serialize
            const txBase64 = bytesToBase64(transaction.toBytes());
            const hip30Id = `hedera:${network}:${hederaId}`;

            // 4. Access the raw Provider
            const provider: any = await connector.getProvider();
            
            // Deep Drill to SignClient (Bypasses EVM layer validation)
            const signClient = provider?.signer?.client || provider?.client;
            const sessionTopic = provider?.session?.topic || provider?.signer?.session?.topic;

            if (signClient && sessionTopic) {
                console.log("Routing via native SignClient for topic:", sessionTopic);
                
                // FORCE Inject / Update namespaces
                try {
                   const session = signClient.session.get(sessionTopic);
                   if (session) {
                       const hNamespace = session.namespaces['hedera'] || { accounts: [], methods: [], events: [] };
                       
                       // Ensure all methods are registered
                       const requiredMethods = ['hedera_signAndExecuteTransaction', 'hedera_signTransaction', 'hedera_executeTransaction', 'hedera_signMessage'];
                       const missingMethods = requiredMethods.filter(m => !hNamespace.methods.includes(m));
                       
                       if (missingMethods.length > 0 || hNamespace.accounts.length === 0) {
                           console.log("Injecting missing Hedera methods/accounts into session...");
                           session.namespaces['hedera'] = {
                               accounts: [...new Set([...hNamespace.accounts, `hedera:${network}:${hederaId}`])],
                               methods: [...new Set([...hNamespace.methods, ...requiredMethods])],
                               events: [...new Set([...hNamespace.events, 'chainChanged', 'accountsChanged'])]
                           };
                       }
                   }
                } catch (e) { 
                    console.error("Namespace injection error:", e);
                }

                try {
                    console.log("Attempting hedera_signAndExecuteTransaction...");
                    return await signClient.request({
                        topic: sessionTopic,
                        chainId: `hedera:${network}`,
                        request: {
                            method: 'hedera_signAndExecuteTransaction',
                            params: { signerAccountId: hip30Id, transactionList: txBase64 }
                        }
                    });
                } catch (rpcError: any) {
                    console.warn("signAndExecute failed:", rpcError.message);
                    if (rpcError.message?.includes("Unsupported method") || rpcError.code === -32601) {
                        console.log("Falling back to hedera_signTransaction...");
                        const signedResponse = await signClient.request({
                            topic: sessionTopic,
                            chainId: `hedera:${network}`,
                            request: {
                                method: 'hedera_signTransaction',
                                params: { signerAccountId: hip30Id, transactionList: txBase64 }
                            }
                        });
                        
                        const signedTx = signedResponse.signedTransaction || signedResponse.transactionList || signedResponse;
                        
                        console.log("Executing signed transaction...");
                        return await signClient.request({
                            topic: sessionTopic,
                            chainId: `hedera:${network}`,
                            request: {
                                method: 'hedera_executeTransaction',
                                params: { signerAccountId: hip30Id, transactionList: signedTx }
                            }
                        });
                    }
                    throw rpcError;
                }
            }

            // Standard provider fallback with resilient retry
            try {
                return await provider.request({
                    method: 'hedera_signAndExecuteTransaction',
                    params: { signerAccountId: hip30Id, transactionList: txBase64 }
                });
            } catch (rpcError: any) {
                if (rpcError.message?.includes("Unsupported method") || rpcError.code === -32601) {
                    const signedResponse = await provider.request({
                        method: 'hedera_signTransaction',
                        params: { signerAccountId: hip30Id, transactionList: txBase64 }
                    });
                    const signedTx = signedResponse.signedTransaction || signedResponse.transactionList || signedResponse;
                    return await provider.request({
                        method: 'hedera_executeTransaction',
                        params: { signerAccountId: hip30Id, transactionList: signedTx }
                    });
                }
                throw rpcError;
            }

        } catch (error: any) {
            console.error("Signer Error:", error);
            throw error;
        }
    }, [connector, address, chain]);

    useEffect(() => {
        if (isConnected && connector && address) {
            setSigner({ executeTransaction, address });
        } else {
            setSigner(null);
        }
    }, [connector, isConnected, address, executeTransaction]);

    return { signer, isConnected };
}
