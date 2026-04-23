'use client';

import { useAccount } from 'wagmi';
import { useEffect, useState, useCallback } from 'react';
import { transactionToBase64String } from '@hashgraph/hedera-wallet-connect';

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

            // 3. Serialize to Base64 using official @hashgraph/hedera-wallet-connect utility
            const txBase64 = transactionToBase64String(transaction);

            const hip30Id = `hedera:${network}:${hederaId}`;

            // 4. Trigger the Wallet Pop-up via RPC
            console.log(`Executing transaction for ${hip30Id} via hedera_signAndExecuteTransaction...`);
            
            const provider: any = await connector.getProvider();

            // Try to extract the WalletConnect SignClient for deep Hedera-native RPC bypassing
            const signClient = provider?.signer?.client || provider?.client;
            const sessionTopic = provider?.session?.topic || provider?.signer?.session?.topic;

            if (signClient && sessionTopic) {
                console.log("Using deep WalletConnect SignClient routing...");
                
                // FORCE INJECT HEDERA NAMESPACE to bypass Wagmi/AppKit EVM strict constraints
                try {
                    const activeSession = signClient.session.get(sessionTopic);
                    if (activeSession && !activeSession.namespaces['hedera']) {
                        console.log("Injecting Hedera namespace into active EVM session...");
                        activeSession.namespaces['hedera'] = {
                            accounts: [`hedera:${network}:${hederaId}`],
                            methods: [
                                'hedera_signAndExecuteTransaction',
                                'hedera_signTransaction',
                                'hedera_executeTransaction',
                                'hedera_signMessage'
                            ],
                            events: ['chainChanged', 'accountsChanged']
                        };
                    }
                } catch (injectionError) {
                    console.warn("Failed to inject namespace, continuing anyway...", injectionError);
                }

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

            // Fallback to standard provider bridge if signClient is unavailable
            return await provider.request({
                method: 'hedera_signAndExecuteTransaction',
                params: {
                    signerAccountId: hip30Id,
                    transactionList: txBase64
                }
            });

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
