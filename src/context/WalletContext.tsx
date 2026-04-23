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
    connect: () => void;
    disconnect: () => void;
    executeTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletState>({
    accountId: null,
    isConnected: false,
    isPairing: false,
    isInitializing: true,
    connect: () => {},
    disconnect: () => {},
    executeTransaction: async () => { throw new Error('Wallet not connected'); }
});

export const useWallet = () => useContext(WalletContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

const APP_METADATA = {
    name: 'GlowSwap Protocol',
    description: 'Institutional-grade DeFi & Meme Launchpad on Hedera',
    icon: 'https://glowswap.vercel.app/logo.png',
    url: 'https://glowswap.vercel.app'
};

const NETWORK = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') as 'mainnet' | 'testnet';
const STORAGE_KEY_ACCOUNT = 'glow_hc_account';
const STORAGE_KEY_TOPIC = 'glow_hc_topic';

export function WalletProvider({ children }: { children: ReactNode }) {
    const [hc, setHc] = useState<any>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isPairing, setIsPairing] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [topic, setTopic] = useState<string | null>(null);

    // ── Initialise HashConnect 3.0 ──────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        const initHashConnect = async () => {
            try {
                console.log("Initializing HashConnect 3.0...");
                const { HashConnect } = await import('hashconnect');
                const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'glowswap-project';
                const instance = new HashConnect(NETWORK, projectId, APP_METADATA, true);

                // Listen for pairing approvals
                instance.pairingEvent.on((data: any) => {
                    console.log("Pairing Event Data:", data);
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

                // Listen for connection status
                instance.connectionStatusChangeEvent.on((status: string) => {
                    console.log("Connection Status Change:", status);
                    if (!mounted) return;
                    if (status === 'Disconnected') {
                        setIsConnected(false);
                        setAccountId(null);
                    }
                });

                // Initialize internal state
                // In HC 3.x, we usually call instance.init()
                const initData = await instance.init();
                console.log("HashConnect Initialized:", initData);

                if (!mounted) return;

                // Try to reconnect if saved
                const savedAccount = localStorage.getItem(STORAGE_KEY_ACCOUNT);
                const savedTopic = localStorage.getItem(STORAGE_KEY_TOPIC);

                if (savedAccount && savedTopic) {
                    console.log("Attempting to restore session:", savedAccount);
                    // In some cases we might need to verify session vitality
                    setAccountId(savedAccount);
                    setTopic(savedTopic);
                    setIsConnected(true);
                }

                setHc(instance);
                setIsInitializing(false);
            } catch (err) {
                console.error("HashConnect Init Error:", err);
                if (mounted) setIsInitializing(false);
            }
        };

        if (typeof window !== 'undefined') {
            initHashConnect();
        }

        return () => { mounted = false; };
    }, []);

    const connect = useCallback(() => {
        if (!hc) {
            console.warn("HashConnect not initialized yet.");
            return;
        }
        
        console.log("Connect button clicked. Opening pairing modal...");
        setIsPairing(true);
        // HashConnect 3.x uses openPairingModal() to show the QR code and extension detectors
        hc.openPairingModal();
    }, [hc]);

    const disconnect = useCallback(async () => {
        console.log("Disconnecting...");
        localStorage.removeItem(STORAGE_KEY_ACCOUNT);
        localStorage.removeItem(STORAGE_KEY_TOPIC);
        setAccountId(null);
        setIsConnected(false);
        if (hc) {
            // Attempt to clear session
            try { await hc.disconnect(); } catch (e) {}
        }
    }, [hc]);

    const executeTransaction = useCallback(async (transaction: any) => {
        if (!hc || !accountId) {
            throw new Error('Wallet not connected. Please connect first.');
        }

        console.log("Executing Transaction...");
        const signer = hc.getSigner();

        const frozen = await transaction.freezeWithSigner(signer);
        const response = await frozen.executeWithSigner(signer);
        console.log("Transaction Execution Response:", response);
        return response;
    }, [hc, accountId]);

    return (
        <WalletContext.Provider value={{
            accountId,
            isConnected,
            isPairing,
            isInitializing,
            connect,
            disconnect,
            executeTransaction,
        }}>
            {children}
        </WalletContext.Provider>
    );
}
