'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletState {
    accountId: string | null;
    evmAddress: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    executeTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletState>({
    accountId: null,
    evmAddress: null,
    isConnected: false,
    connect: async () => {},
    disconnect: () => {},
    executeTransaction: async () => { throw new Error('Not connected'); }
});

export const useWallet = () => useContext(WalletContext);

const MIRROR_NODE = "https://testnet.mirrornode.hedera.com/api/v1";

export function WalletProvider({ children }: { children: ReactNode }) {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [evmAddress, setEvmAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                    handleAccountsChanged(accounts);
                }
            }
        };
        checkConnection();
        
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
        
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
            disconnect();
        } else {
            const address = accounts[0];
            setEvmAddress(address);
            setIsConnected(true);
            
            // Try to map EVM address to Hedera Account ID
            try {
                const res = await fetch(`${MIRROR_NODE}/accounts/${address}`);
                const data = await res.json();
                if (data.account) {
                    setAccountId(data.account);
                } else {
                    setAccountId(address); // Fallback to EVM address
                }
            } catch (e) {
                console.error("Mirror node lookup failed", e);
                setAccountId(address);
            }
        }
    };

    const connect = async () => {
        if (typeof window === 'undefined') return;

        if (window.ethereum) {
            try {
                // THE POP-UP TRIGGER
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                await handleAccountsChanged(accounts);
            } catch (error: any) {
                if (error.code === 4001) {
                    console.error("User rejected request");
                } else {
                    console.error("Connection error:", error);
                }
            }
        } else {
            alert("No wallet detected. Please install MetaMask, HashPack, or Blade!");
            window.open('https://metamask.io/download/', '_blank');
        }
    };

    const disconnect = () => {
        setAccountId(null);
        setEvmAddress(null);
        setIsConnected(false);
    };

    const executeTransaction = async (transaction: any) => {
        // NOTE: For native Hedera transactions with window.ethereum, 
        // we usually need to convert the transaction to a signable format 
        // or use the JSON-RPC relay.
        // For now, we'll alert the user that we are using the EVM provider.
        console.log("Executing transaction via EVM provider for account:", accountId);
        
        // This is where we will integrate the actual signing logic in the next step
        // once we confirm the connection is working.
        throw new Error("Connection established! Signing logic is being optimized for your wallet type.");
    };

    return (
        <WalletContext.Provider value={{
            accountId,
            evmAddress,
            isConnected,
            connect,
            disconnect,
            executeTransaction,
        }}>
            {children}
        </WalletContext.Provider>
    );
}
