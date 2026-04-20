'use client';

import { useAccount, useConnectorClient } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';

/**
 * Robust utility to convert Uint8Array to Base64 in a browser environment.
 */
function bytesToBase64(bytes: Uint8Array): string {
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
}

/**
 * Hook to bridge the Wagmi/AppKit connector to the Hedera WalletConnect v2 RPC protocol.
 * Optimized for HashPack and Blade browser extensions.
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
            // 1. Resolve Hedera Identities and Network
            const network = chain?.id === 295 ? 'mainnet' : 'testnet';
            const hederaId = localStorage.getItem('hashmeme_last_account_id');
            if (!hederaId) throw new Error("Hedera Account ID not resolved yet.");

            // 2. Prepare Transaction for HashPack/Blade
            // IMPORTANT: Wallets need Node Account IDs to be set explicitly before freezing
            // for WalletConnect v2 to serialize correctly.
            const { AccountId } = await import('@hashgraph/sdk');
            const defaultNodeId = network === 'mainnet' ? '0.0.3' : '0.0.3'; // Standard testnet/mainnet node
            
            if (!transaction.isFrozen()) {
                transaction.setNodeAccountIds([AccountId.fromString(defaultNodeId)]);
                transaction.freeze();
            }

            // 3. Serialize to Base64 using robust browser utility
            const txBytes = transaction.toBytes();
            const txBase64 = bytesToBase64(txBytes);

            const hip30Id = `hedera:${network}:${hederaId}`;

            // 4. Trigger the Wallet Pop-up via RPC
            console.log(`Pumping transaction for ${hip30Id} to HashPack...`);
            
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
