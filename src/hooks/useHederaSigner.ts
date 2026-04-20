'use client';

import { useAccount, useConnectorClient } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to bridge the Wagmi/AppKit connector to the Hedera WalletConnect v2 RPC protocol.
 * This ensures that wallets like HashPack and Blade correctly pop up for transaction signing.
 */
export function useHederaSigner() {
    const { isConnected, address, chain } = useAccount();
    const { data: client } = useConnectorClient();
    const [signer, setSigner] = useState<any | null>(null);

    /**
     * Executes a Hedera Transaction using the connected WalletConnect session.
     */
    const executeTransaction = useCallback(async (transaction: any) => {
        if (!client || !address) throw new Error("Wallet not connected");

        try {
            // 1. Prepare Transaction for serialization
            // Note: Transactions must be frozen and have node account IDs set for WC v2
            if (!transaction.isFrozen()) {
                transaction.freeze();
            }

            // 2. Serialize to Base64 (Standard for hedera_signAndExecuteTransaction)
            const txBytes = transaction.toBytes();
            const txBase64 = Buffer.from(txBytes).toString('base64');

            // 3. Format Account ID for HIP-30 (hedera:<network>:<id>)
            const network = chain?.id === 295 ? 'mainnet' : 'testnet'; // 295 is Hedera Mainnet, 296 is Testnet
            
            // We'll need the 0.0.x ID from the useHederaAccount hook normally, 
            // but the signer needs it to know who is signing.
            const hederaId = localStorage.getItem('hashmeme_last_account_id');
            if (!hederaId) throw new Error("Hedera Account ID not resolved yet. Please wait a moment.");

            const hip30Id = `hedera:${network}:${hederaId}`;

            // 4. Trigger the Wallet Pop-up via RPC
            console.log("Triggering HashPack/Blade pop-up via hedera_signAndExecuteTransaction...");
            
            const response: any = await (client as any).request({
                method: 'hedera_signAndExecuteTransaction',
                params: {
                    signerAccountId: hip30Id,
                    transactionList: txBase64
                }
            });

            return response;
        } catch (error: any) {
            console.error("Signing Error:", error);
            throw error;
        }
    }, [client, address, chain]);

    useEffect(() => {
        if (isConnected && client && address) {
            // Bridge object that components will use
            setSigner({
                executeTransaction,
                address
            });
        } else {
            setSigner(null);
        }
    }, [client, isConnected, address, executeTransaction]);

    return { signer, isConnected };
}
