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

// ─── Constants ────────────────────────────────────────────────────────────────

const NETWORK = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase() as any;
const PROJECT_ID = "3ee917f6510a7673574c8035174c8035"; // Global stable project ID

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
            console.log("[Wallet] Rebuilding for stability...");
            const { HashConnect } = await import('hashconnect');
            
            // HashConnect 3.x simple factory-style init
            const instance = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA, true);

            instance.pairingEvent.on((data: any) => {
                console.log("[Wallet] Paired:", data);
                const acc = data.accountIds?.[0];
                if (acc) {
                    setAccountId(acc);
                    setIsConnected(true);
                    localStorage.setItem('glow_acc_v4', acc);
                    localStorage.setItem('glow_topic_v4', data.topic);
                }
            });

            instance.disconnectionEvent.on(() => {
                setAccountId(null);
                setIsConnected(false);
                localStorage.removeItem('glow_acc_v4');
            });

            // Initialise and restore
            try {
                await instance.init();
                const saved = localStorage.getItem('glow_acc_v4');
                if (saved) {
                    setAccountId(saved);
                    setIsConnected(true);
                }
                setHc(instance);
            } catch (err) {
                console.error("[Wallet] Init Failed:", err);
            }
        };

        if (typeof window !== 'undefined') init();
    }, []);

    const connect = async () => {
        if (!hc) {
            alert("GlowSwap is still syncing with Hedera. Please wait 1 second and try again.");
            return;
        }

        try {
            // Priority 1: Try to talk to HashPack Extension directly
            console.log("[Wallet] Attempting direct extension handshake...");
            
            // Priority 2: Use the universal pairing modal
            // In many browsers, this is the only way to trigger the popup due to security regs
            hc.openPairingModal();
        } catch (e) {
            console.error("[Wallet] Connect Error:", e);
        }
    };

    const disconnect = () => {
        setAccountId(null);
        setIsConnected(false);
        localStorage.removeItem('glow_acc_v4');
        localStorage.removeItem('glow_topic_v4');
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
