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
// Global stable project ID for WalletConnect v2
const PROJECT_ID = "3ee917f6510a7673574c8035174c8035"; 

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
        let mounted = true;

        const init = async () => {
            console.log("[Wallet] Initializing HashConnect...");
            try {
                const { HashConnect } = await import('hashconnect');
                const instance = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA, true);

                instance.pairingEvent.on((data: any) => {
                    console.log("[Wallet] Paired Event:", data);
                    const acc = data.accountIds?.[0];
                    if (acc && mounted) {
                        setAccountId(acc);
                        setIsConnected(true);
                        localStorage.setItem('glow_acc_v5', acc);
                    }
                });

                instance.disconnectionEvent.on(() => {
                    if (mounted) {
                        setAccountId(null);
                        setIsConnected(false);
                    }
                    localStorage.removeItem('glow_acc_v5');
                });

                // Init with a 5 second fuse - if it hangs, we set it anyway
                // Some environments have trouble with the bridge handshake but can still open the modal
                const initTimeout = setTimeout(() => {
                    if (mounted && !hc) {
                        console.warn("[Wallet] Init taking too long, forcing active state...");
                        setHc(instance); 
                    }
                }, 5000);

                await instance.init();
                clearTimeout(initTimeout);
                
                if (!mounted) return;
                
                const saved = localStorage.getItem('glow_acc_v5');
                if (saved) {
                    setAccountId(saved);
                    setIsConnected(true);
                }
                
                setHc(instance);
                console.log("[Wallet] HashConnect Ready");

            } catch (err) {
                console.error("[Wallet] Fatal Error during setup:", err);
            }
        };

        if (typeof window !== 'undefined') init();
        return () => { mounted = false; };
    }, []);

    const connect = async () => {
        // If hc is still null, it might be due to a slow handshake
        if (!hc) {
            console.log("[Wallet] Force-clicking init bridge...");
        }

        try {
            // Even if init is slow, openPairingModal often works if the instance exists
            if (hc) {
                hc.openPairingModal();
            } else {
                // If it's truly not there yet, try one last time to get it from memory
                const { HashConnect } = await import('hashconnect');
                const instance = new HashConnect(NETWORK, PROJECT_ID, APP_METADATA, true);
                await instance.init();
                instance.openPairingModal();
                setHc(instance);
            }
        } catch (e) {
            console.error("[Wallet] Connect Exception:", e);
            alert("Connection bridge is still stabilizing. Please refresh the page.");
        }
    };

    const disconnect = () => {
        setAccountId(null);
        setIsConnected(false);
        localStorage.removeItem('glow_acc_v5');
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
