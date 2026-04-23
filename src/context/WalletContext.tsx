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
    name: "GlowSwap Protocol",
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
            try {
                const { HashConnect } = await import('hashconnect');
                const instance = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA as any, true);
                
                // CRITICAL: Set instance BEFORE init so it's ready for clicks
                globalHC = instance;

                instance.pairingEvent.on((data: any) => {
                    console.log("[HashConnect] Pairing success:", data);
                    const acc = data.accountIds?.[0];
                    if (acc) {
                        setAccountId(acc);
                        setIsConnected(true);
                        localStorage.setItem('glow_v8_acc', acc);
                    }
                });

                await instance.init();
                console.log("[HashConnect] Initialization complete");

                const saved = localStorage.getItem('glow_v8_acc');
                if (saved) {
                    setAccountId(saved);
                    setIsConnected(true);
                }
            } catch (err) {
                console.error("[HashConnect] Setup error:", err);
            }
        };

        if (typeof window !== 'undefined') init();
    }, []);

    const connect = async () => {
        console.log("[Connect] Attempting to open wallet...");
        
        if (!globalHC) {
            // Emergent fallback
            const { HashConnect } = await import('hashconnect');
            globalHC = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA as any, true);
            await globalHC.init();
        }

        try {
            // First, try the internal pairing modal
            globalHC.openPairingModal();
        } catch (e) {
            console.error("[Connect] Modal failed", e);
            // Second, try direct extension call
            try {
                await globalHC.connectToExtension();
            } catch (e2) {
                // Third, show the setup instructions as an alert
                alert("Please ensure HashPack is installed and click again. If you are on mobile, use the HashPack browser.");
            }
        }
    };

    const disconnect = () => {
        setAccountId(null);
        setIsConnected(false);
        localStorage.removeItem('glow_v8_acc');
        if (globalHC) {
            try { globalHC.disconnect(); } catch (e) {}
        }
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
