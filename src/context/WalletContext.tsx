'use client';

/**
 * WalletContext.tsx
 * Clean HashConnect-only wallet connection for Hedera.
 * No WalletConnect. No AppKit. No EVM namespace conflicts.
 */

import React, {
    createContext, useContext, useState,
    useEffect, useCallback, ReactNode
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletState {
    accountId: string | null;
    isConnected: boolean;
    isPairing: boolean;
    pairingString: string | null;
    connect: () => void;
    disconnect: () => void;
    executeTransaction: (transaction: any) => Promise<any>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletState>({
    accountId: null,
    isConnected: false,
    isPairing: false,
    pairingString: null,
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
    const [pairingString, setPairingString] = useState<string | null>(null);
    const [topic, setTopic] = useState<string | null>(null);

    // ── Initialise HashConnect (browser only) ───────────────────────────────
    useEffect(() => {
        let mounted = true;

        (async () => {
            const { HashConnect } = await import('hashconnect');
            const instance = new HashConnect(false);

            // Fired when a wallet approves the pairing
            instance.pairingEvent.on((data: any) => {
                if (!mounted) return;
                const acc = data.accountIds?.[0];
                if (acc) {
                    setAccountId(acc);
                    setIsConnected(true);
                    setIsPairing(false);
                    setPairingString(null);
                    localStorage.setItem(STORAGE_KEY_ACCOUNT, acc);
                    localStorage.setItem(STORAGE_KEY_TOPIC, data.topic);
                    // Also store for legacy hooks
                    localStorage.setItem('glowswap_last_account_id', acc);
                }
            });

            // Fired on disconnect
            instance.connectionStatusChangeEvent.on((status: string) => {
                if (!mounted) return;
                if (status === 'Disconnected') {
                    setIsConnected(false);
                    setAccountId(null);
                }
            });

            // Init – returns topic & pairingString
            const initData = await instance.init(APP_METADATA, NETWORK, false);

            if (!mounted) return;

            // Restore previous session
            const savedAccount = localStorage.getItem(STORAGE_KEY_ACCOUNT);
            const savedTopic = localStorage.getItem(STORAGE_KEY_TOPIC);

            if (savedAccount && savedTopic) {
                setAccountId(savedAccount);
                setTopic(savedTopic);
                setIsConnected(true);
            } else {
                setTopic(initData.topic);
                setPairingString(initData.pairingString);
            }

            setHc(instance);
        })();

        return () => { mounted = false; };
    }, []);

    // ── Connect: opens HashPack / Blade pairing dialog ─────────────────────
    const connect = useCallback(() => {
        if (!hc || !pairingString) return;
        setIsPairing(true);
        hc.connectToLocalWallet(pairingString);
    }, [hc, pairingString]);

    // ── Disconnect ──────────────────────────────────────────────────────────
    const disconnect = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY_ACCOUNT);
        localStorage.removeItem(STORAGE_KEY_TOPIC);
        localStorage.removeItem('glowswap_last_account_id');
        setAccountId(null);
        setIsConnected(false);
        setPairingString(null);
    }, []);

    // ── Execute a Hedera transaction (native – no WalletConnect) ────────────
    const executeTransaction = useCallback(async (transaction: any) => {
        if (!hc || !accountId || !topic) {
            throw new Error('Wallet not connected. Please connect first.');
        }

        const provider = hc.getProvider(NETWORK, topic, accountId);
        const signer = hc.getSigner(provider);

        // freezeWithSigner sets the node IDs, payer, and tx ID automatically
        const frozen = await transaction.freezeWithSigner(signer);
        const response = await frozen.executeWithSigner(signer);
        return response;
    }, [hc, accountId, topic]);

    return (
        <WalletContext.Provider value={{
            accountId,
            isConnected,
            isPairing,
            pairingString,
            connect,
            disconnect,
            executeTransaction,
        }}>
            {children}
        </WalletContext.Provider>
    );
}
