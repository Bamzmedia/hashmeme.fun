'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletState {
    accountId: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    executeTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletState>({
    accountId: null,
    isConnected: false,
    connect: async () => {},
    disconnect: () => {},
    executeTransaction: async () => { throw new Error('Not connected'); }
});

export const useWallet = () => useContext(WalletContext);

const NETWORK = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase() as any;
// USE THE PROVEN PROJECT ID
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3ee917f6510a7673574c8035174c8035";

const APP_METADATA = {
    name: "GlowSwap Protocol",
    description: "Hedera Meme Launchpad",
    icons: ["https://glowswap.vercel.app/logo.png"], // NOTE: icons is often expected to be an array in WCv2
    url: "https://glowswap.vercel.app"
};

export function WalletProvider({ children }: { children: ReactNode }) {
    const [hc, setHc] = useState<any>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { HashConnect } = await import('hashconnect');
            const instance = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA as any, true);

            instance.pairingEvent.on((data: any) => {
                const acc = data.accountIds?.[0];
                if (acc) {
                    setAccountId(acc);
                    setIsConnected(true);
                    localStorage.setItem('glow_acc_v6', acc);
                }
            });

            await instance.init();
            
            const saved = localStorage.getItem('glow_acc_v6');
            if (saved) {
                setAccountId(saved);
                setIsConnected(true);
            }
            
            setHc(instance);
        };

        if (typeof window !== 'undefined') init();
    }, []);

    const connect = async () => {
        if (!hc) return;

        try {
            console.log("[Wallet] Attempting to find local wallets...");
            // HashConnect 3.x method to find extensions
            const localWallets = await hc.findLocalWallets();
            console.log("[Wallet] Local wallets found:", localWallets);

            if (localWallets && localWallets.length > 0) {
                // If HashPack/Blade is found, connect to the first one directly
                await hc.connectToExtension();
            } else {
                // Otherwise open the modal for mobile/QR
                await hc.openPairingModal();
            }
        } catch (e) {
            console.error("[Wallet] Connect Error:", e);
            // Absolute fallback: Generate string and show it
            const pString = hc.generatePairingString();
            prompt("Could not open wallet automatically. Copy this pairing string into HashPack -> Settings -> WalletConnect:", pString);
        }
    };

    const disconnect = () => {
        setAccountId(null);
        setIsConnected(false);
        localStorage.removeItem('glow_acc_v6');
        if (hc) hc.disconnect();
    };

    const executeTransaction = async (transaction: any) => {
        if (!hc || !accountId) throw new Error('Connect wallet first');
        const signer = hc.getSigner();
        const frozen = await transaction.freezeWithSigner(signer);
        return await frozen.executeWithSigner(signer);
    };

    return (
        <WalletContext.Provider value={{ accountId, isConnected, connect, disconnect, executeTransaction }}>
            {children}
        </WalletContext.Provider>
    );
}
