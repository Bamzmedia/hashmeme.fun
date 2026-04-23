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
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3ee917f6510a7673574c8035174c8035";

const APP_METADATA = {
    name: "GlowSwap",
    description: "Hedera Meme Launchpad",
    icon: "https://glowswap.vercel.app/logo.png",
    url: "https://glowswap.vercel.app"
};

export function WalletProvider({ children }: { children: ReactNode }) {
    const [hc, setHc] = useState<any>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { HashConnect } = await import('hashconnect');
            const instance = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA, true);

            instance.pairingEvent.on((data: any) => {
                const acc = data.accountIds?.[0];
                if (acc) {
                    setAccountId(acc);
                    setIsConnected(true);
                    localStorage.setItem('glow_acc', acc);
                }
            });

            instance.disconnectionEvent.on(() => {
                setAccountId(null);
                setIsConnected(false);
                localStorage.removeItem('glow_acc');
            });

            await instance.init();

            const saved = localStorage.getItem('glow_acc');
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
            await hc.openPairingModal();
        } catch (e) {
            console.error("Connect error:", e);
        }
    };

    const disconnect = () => {
        setAccountId(null);
        setIsConnected(false);
        localStorage.removeItem('glow_acc');
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
