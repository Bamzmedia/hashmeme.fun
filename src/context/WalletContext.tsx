'use client';

import React, {
    createContext, useContext, useState,
    useEffect, useCallback, ReactNode
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletState {
    accountId: string | null;
    isConnected: boolean;
    isPairing: boolean;
    isInitializing: boolean;
    error: string | null;
    connect: () => void;
    disconnect: () => void;
    executeTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletState>({
    accountId: null,
    isConnected: false,
    isPairing: false,
    isInitializing: true,
    error: null,
    connect: () => {},
    disconnect: () => {},
    executeTransaction: async () => { throw new Error('Wallet not connected'); }
});

export const useWallet = () => useContext(WalletContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

const APP_METADATA = {
    name: 'GlowSwap',
    description: 'Hedera Meme Launchpad',
    icon: 'https://glowswap.vercel.app/logo.png',
    url: 'https://glowswap.vercel.app'
};

const NETWORK = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet').toLowerCase();
const STORAGE_KEY_ACCOUNT = 'glow_hc_account_v3';
const STORAGE_KEY_TOPIC = 'glow_hc_topic_v3';

export function WalletProvider({ children }: { children: ReactNode }) {
    const [hc, setHc] = useState<any>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isPairing, setIsPairing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            try {
                const { HashConnect } = await import('hashconnect');
                
                // Use the provided WC project ID or a fallback
                // NOTE: WalletConnect v2 IDs must be valid. If missing, we use a placeholder.
                const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3ee917f6510a7673574c8035174c8035'; 
                
                console.log(`[HashConnect] Initializing for ${NETWORK} with project ${projectId}...`);
                
                const instance = new HashConnect(NETWORK as any, projectId, APP_METADATA, true);

                instance.pairingEvent.on((data: any) => {
                    console.log("[HashConnect] Pairing approved:", data);
                    if (!mounted) return;
                    const acc = data.accountIds?.[0];
                    if (acc) {
                        setAccountId(acc);
                        setIsConnected(true);
                        setIsPairing(false);
                        localStorage.setItem(STORAGE_KEY_ACCOUNT, acc);
                        localStorage.setItem(STORAGE_KEY_TOPIC, data.topic);
                    }
                });

                instance.disconnectionEvent.on((data: any) => {
                    console.log("[HashConnect] Disconnected:", data);
                    if (!mounted) return;
                    setIsConnected(false);
                    setAccountId(null);
                });

                // Set a timeout for init() so we don't hang forever
                const initPromise = instance.init();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("HashConnect initialization timed out")), 8000)
                );

                await Promise.race([initPromise, timeoutPromise]);
                console.log("[HashConnect] Init successful");

                if (!mounted) return;

                // Restore session
                const savedAccount = localStorage.getItem(STORAGE_KEY_ACCOUNT);
                if (savedAccount) {
                    setAccountId(savedAccount);
                    setIsConnected(true);
                }

                setHc(instance);
                setIsInitializing(false);
            } catch (err: any) {
                console.error("[HashConnect] Init failed:", err);
                if (mounted) {
                    setError(err.message);
                    setIsInitializing(false);
                }
            }
        };

        init();
        return () => { mounted = false; };
    }, []);

    const connect = useCallback(() => {
        if (!hc) return;
        setIsPairing(true);
        try {
            hc.openPairingModal();
        } catch (e) {
            console.error("Modal failed to open:", e);
            setIsPairing(false);
        }
    }, [hc]);

    const disconnect = useCallback(async () => {
        localStorage.removeItem(STORAGE_KEY_ACCOUNT);
        localStorage.removeItem(STORAGE_KEY_TOPIC);
        setAccountId(null);
        setIsConnected(false);
        if (hc) {
            try { await hc.disconnect(); } catch (e) {}
        }
    }, [hc]);

    const executeTransaction = useCallback(async (transaction: any) => {
        if (!hc || !accountId) throw new Error('Not connected');
        const signer = hc.getSigner();
        const frozen = await transaction.freezeWithSigner(signer);
        return await frozen.executeWithSigner(signer);
    }, [hc, accountId]);

    return (
        <WalletContext.Provider value={{
            accountId,
            isConnected,
            isPairing,
            isInitializing,
            error,
            connect,
            disconnect,
            executeTransaction,
        }}>
            {children}
        </WalletContext.Provider>
    );
}
