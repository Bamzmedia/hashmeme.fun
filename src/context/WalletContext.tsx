'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// STABLE GLOBAL INSTANCE
let globalHC: any = null;

interface WalletState {
    accountId: string | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
    executeTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletState>({
    accountId: null,
    isConnected: false,
    connect: () => {},
    disconnect: () => {},
    executeTransaction: async () => { throw new Error('Not connected'); }
});

export const useWallet = () => useContext(WalletContext);

const NETWORK = "testnet";
const PROJECT_ID = "3ee917f6510a7673574c8035174c8035";

const APP_METADATA = {
    name: "GlowSwap Hub",
    description: "Hedera Meme Launchpad",
    icons: ["https://glowswap.vercel.app/logo.png"],
    url: "https://glowswap.vercel.app"
};

export function WalletProvider({ children }: { children: ReactNode }) {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (globalHC) return;
            const { HashConnect } = await import('hashconnect');
            const instance = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA as any, true);

            instance.pairingEvent.on((data: any) => {
                const acc = data.accountIds?.[0];
                if (acc) {
                    setAccountId(acc);
                    setIsConnected(true);
                    localStorage.setItem('glow_acc_v7', acc);
                }
            });

            await instance.init();
            globalHC = instance;

            const saved = localStorage.getItem('glow_acc_v7');
            if (saved) {
                setAccountId(saved);
                setIsConnected(true);
            }
        };

        if (typeof window !== 'undefined') init();
    }, []);

    const connect = () => {
        if (!globalHC) {
            // Instant retry if not ready
            import('hashconnect').then(async ({ HashConnect }) => {
                globalHC = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA as any, true);
                await globalHC.init();
                globalHC.openPairingModal();
            });
            return;
        }
        
        // INSTANT 1-CLICK ACTION
        try {
            globalHC.openPairingModal();
        } catch (e) {
            console.error("Modal failed", e);
        }
    };

    const disconnect = () => {
        setAccountId(null);
        setIsConnected(false);
        localStorage.removeItem('glow_acc_v7');
        if (globalHC) globalHC.disconnect();
    };

    const executeTransaction = async (transaction: any) => {
        if (!globalHC || !accountId) throw new Error('Connect wallet first');
        const signer = globalHC.getSigner();
        const frozen = await transaction.freezeWithSigner(signer);
        return await frozen.executeWithSigner(signer);
    };

    return (
        <WalletContext.Provider value={{ accountId, isConnected, connect, disconnect, executeTransaction }}>
            {children}
        </WalletContext.Provider>
    );
}
