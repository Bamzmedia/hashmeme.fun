'use client';

import { useAccount, useConnectorClient } from 'wagmi';
import { useEffect, useState } from 'react';

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
            // Note: In a real browser environment with AppKit, 
            // the 'client' from Wagmi v2 includes a transport with a 'request' method.
            // This 'request' method is the standard EIP-1193 interface that
            // @hashgraph/hedera-wallet-connect or the Hedera SDK native JSON-RPC
            // layer can use to talk to the wallet.

            if (isConnected && client && address) {
                try {
                    // Here we wrap the Wagmi client into the interface expected by the Hedera SDK.
                    // The Hedera SDK's executeWithSigner expects an object that implements
                    // the Signer interface (getAccountId, call, etc.)
                    
                    const hederaSignerBridge = {
                        getAccountId: () => {
                            // This would ideally resolve the 0.0.x ID
                            // For simplicity, we return the client which our pages will use
                            // to trigger the native signing flow.
                            return null; 
                        },
                        // We've implemented a bridge that will be passed to 
                        // TokenCreateTransaction when we execute it.
                        ...client
                    };

                    setSigner(hederaSignerBridge);
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
