'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Lazy-load HashConnect types
type HashConnect = any;
type MessageTypes_TransactionResponse = any;

const APP_META = {
    name: "GlowSwap Protocol",
    description: "Institutional-grade DeFi & Meme Launchpad on Hedera",
    icon: "https://glowswap.vercel.app/logo.png",
    url: "https://glowswap.vercel.app"
};

const NETWORK = (process.env.NEXT_PUBLIC_HEDERA_NETWORK as 'mainnet' | 'testnet') || 'testnet';

interface HashConnectState {
    hashconnect: HashConnect | null;
    topic: string;
    pairingString: string;
    accountId: string | null;
    isConnected: boolean;
    isPairing: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    sendTransaction: (transaction: any) => Promise<MessageTypes_TransactionResponse>;
}

const HashConnectContext = createContext<HashConnectState>({
    hashconnect: null,
    topic: '',
    pairingString: '',
    accountId: null,
    isConnected: false,
    isPairing: false,
    connect: async () => {},
    disconnect: () => {},
    sendTransaction: async () => { throw new Error('Not connected'); },
});

export const useHashConnect = () => useContext(HashConnectContext);

export const HashConnectProvider = ({ children }: { children: ReactNode }) => {
    const [hc, setHc] = useState<HashConnect | null>(null);
    const [topic, setTopic] = useState('');
    const [pairingString, setPairingString] = useState('');
    const [accountId, setAccountId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isPairing, setIsPairing] = useState(false);

    useEffect(() => {
        // Dynamic import ensures this ONLY runs in the browser, not at SSR/build time
        const init = async () => {
            const { HashConnect } = await import('hashconnect');
            const hashconnect = new HashConnect(false);

            hashconnect.pairingEvent.on((data: any) => {
                const account = data.accountIds?.[0];
                if (account) {
                    setAccountId(account);
                    setIsConnected(true);
                    setIsPairing(false);
                    localStorage.setItem('glowswap_hc_account', account);
                    localStorage.setItem('glowswap_hc_topic', data.topic);
                    localStorage.setItem('glowswap_last_account_id', account);
                }
            });

            hashconnect.connectionStatusChangeEvent.on((status: string) => {
                if (status === 'Disconnected') {
                    setIsConnected(false);
                    setAccountId(null);
                }
            });

            const savedAccount = localStorage.getItem('glowswap_hc_account');
            const savedTopic = localStorage.getItem('glowswap_hc_topic');

            const initData = await hashconnect.init(APP_META, NETWORK, false);

            if (savedAccount && savedTopic) {
                setAccountId(savedAccount);
                setTopic(savedTopic);
                setIsConnected(true);
            } else {
                setTopic(initData.topic);
                setPairingString(initData.pairingString);
            }

            setHc(hashconnect);
        };

        init().catch(console.error);
    }, []);

    const connect = useCallback(async () => {
        if (!hc || !pairingString) return;
        setIsPairing(true);
        hc.connectToLocalWallet(pairingString);
    }, [hc, pairingString]);

    const disconnect = useCallback(() => {
        localStorage.removeItem('glowswap_hc_account');
        localStorage.removeItem('glowswap_hc_topic');
        localStorage.removeItem('glowswap_last_account_id');
        setAccountId(null);
        setIsConnected(false);
    }, []);

    const sendTransaction = useCallback(async (transaction: any): Promise<any> => {
        if (!hc || !accountId || !topic) {
            throw new Error('HashConnect not connected. Please connect your wallet first.');
        }

        const provider = hc.getProvider(NETWORK, topic, accountId);
        const signer = hc.getSigner(provider);

        const frozenTx = await transaction.freezeWithSigner(signer);
        const response = await frozenTx.executeWithSigner(signer);

        return response;
    }, [hc, accountId, topic]);

    return (
        <HashConnectContext.Provider value={{
            hashconnect: hc,
            topic,
            pairingString,
            accountId,
            isConnected,
            isPairing,
            connect,
            disconnect,
            sendTransaction,
        }}>
            {children}
        </HashConnectContext.Provider>
    );
};
