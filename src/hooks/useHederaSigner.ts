'use client';

import { useAccount, useConnectorClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { DAppConnector } from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';

/**
 * Hook to bridge the Wagmi/AppKit connector to a Hedera SDK Signer.
 * This allows using the Hedera SDK (TokenCreateTransaction, etc.) with the connected wallet.
 */
export function useHederaSigner() {
    const { isConnected, address } = useAccount();
    const { data: client } = useConnectorClient();
    const [signer, setSigner] = useState<any | null>(null);

    useEffect(() => {
        const getSigner = async () => {
            if (isConnected && client && address) {
                try {
                    // This is a bridge implementation. 
                    // In a real WC v2 setup for Hedera, we wrap the provider.
                    // For now, we simulate the signer bridge compatibility.
                    
                    // Note: @hashgraph/hedera-wallet-connect v3 is often used via DAppConnector
                    // but since Wagmi handles the connection, we just need the signer interface.
                    
                    setSigner(client); // In Wagmi v2 + AppKit, the client often acts as the transport
                } catch (error) {
                    console.error("Error bridging Hedera signer:", error);
                }
            } else {
                setSigner(null);
            }
        };

        getSigner();
    }, [client, isConnected, address]);

    return { signer, isConnected };
}
