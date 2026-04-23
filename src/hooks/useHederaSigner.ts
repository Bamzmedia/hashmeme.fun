'use client';

import { useAccount, useConnectorClient } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';

/**
 * Robust utility to convert Uint8Array to Base64 in a browser environment.
 * Replaces the fragile btoa/charCodeAt approach for binary stability.
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
 * Hook to bridge the Wagmi/AppKit connector to the Hedera WalletConnect v2 RPC protocol.
 * Optimized for HashPack and Blade browser extensions.
 */
export function useHederaSigner() {
    const { isConnected, address, chain, connector } = useAccount();
    const [signer, setSigner] = useState<any | null>(null);

    /**
     * Executes a Hedera Transaction using the connected WalletConnect session.
     */
    const executeTransaction = useCallback(async (transaction: any) => {
        if (!connector || !address) throw new Error("Wallet not connected");

        try {
            // 1. Resolve Hedera Identities and Network
            const network = chain?.id === 295 ? 'mainnet' : 'testnet';
            const hederaId = localStorage.getItem('glowswap_last_account_id');
            if (!hederaId) throw new Error("Hedera Account ID not resolved yet. Please reconnect.");

            // 2. Prepare Transaction for HashPack/Blade
            const { AccountId, TransactionId } = await import('@hashgraph/sdk');
            const defaultNodeId = '0.0.3'; // Standard testnet node
            
            if (!transaction.isFrozen()) {
                transaction.setTransactionId(TransactionId.generate(AccountId.fromString(hederaId)));
                transaction.setNodeAccountIds([AccountId.fromString(defaultNodeId)]);
                transaction.freeze();
            }

            // 3. Serialize to Base64 using robust browser utility
            const txBytes = transaction.toBytes();
            const txBase64 = bytesToBase64(txBytes);

            const hip30Id = `hedera:${network}:${hederaId}`;

            // 4. Trigger the Wallet Pop-up via RPC
            console.log(`Executing transaction for ${hip30Id} via native bridge...`);
            
            const provider: any = await connector.getProvider();

            try {
                const response: any = await provider.request({
                    method: 'hedera_signAndExecuteTransaction',
                    params: {
                        signerAccountId: hip30Id,
                        transactionList: txBase64
                    }
                });
                return response;
            } catch (rpcError: any) {
                console.warn("Unified signAndExecute failed, attempting legacy fallback...", rpcError);
                // Fallback sequence: Sign then Execute
                const signedResponse: any = await provider.request({
                    method: 'hedera_signTransaction',
                    params: {
                        signerAccountId: hip30Id,
                        transactionList: txBase64
                    }
                });
                
                // Extract the signed transaction bytes/base64 from the wallet response
                // Response format varies by wallet, but usually contains a signedTransaction or similar
                const signedTx = signedResponse.signedTransaction || signedResponse.transactionList || signedResponse;

                const executeResponse: any = await provider.request({
                    method: 'hedera_executeTransaction',
                    params: {
                        signerAccountId: hip30Id,
                        transactionList: signedTx
                    }
                });
                return executeResponse;
            }
        } catch (error: any) {
            console.error("Native Bridge Error:", error);
            throw error;
        }
    }, [connector, address, chain]);

    useEffect(() => {
        if (isConnected && connector && address) {
            setSigner({
                executeTransaction,
                address
            });
        } else {
            setSigner(null);
        }
    }, [connector, isConnected, address, executeTransaction]);

    return { signer, isConnected };
}
