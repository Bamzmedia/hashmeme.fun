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
                console.log("Routing via native SignClient...");
                
                // Inject namespace if missing (Safety check)
                try {
                   const session = signClient.session.get(sessionTopic);
                   if (session && !session.namespaces['hedera']) {
                       session.namespaces['hedera'] = {
                           accounts: [`hedera:${network}:${hederaId}`],
                           methods: ['hedera_signAndExecuteTransaction', 'hedera_signTransaction', 'hedera_signMessage'],
                           events: ['chainChanged', 'accountsChanged']
                       };
                   }
                } catch (e) { /* silent fail */ }

                return await signClient.request({
                    topic: sessionTopic,
                    chainId: `hedera:${network}`,
                    request: {
                        method: 'hedera_signAndExecuteTransaction',
                        params: {
                            signerAccountId: hip30Id,
                            transactionList: txBase64
                        }
                    }
                });
            }

            // Standard fallback
            return await provider.request({
                method: 'hedera_signAndExecuteTransaction',
                params: {
                    signerAccountId: hip30Id,
                    transactionList: txBase64
                }
            });

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
