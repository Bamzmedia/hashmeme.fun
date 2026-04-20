'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface HashConnectContextType {
  hashConnect: any | null;
  state: any;
  pairingData: any | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  accountId: string | null;
}

const HashConnectContext = createContext<HashConnectContextType>({
  hashConnect: null,
  state: 0, // Default disconnected state
  pairingData: null,
  connect: async () => {},
  disconnect: async () => {},
  accountId: null,
});

export const HashConnectProvider = ({ children }: { children: ReactNode }) => {
  const [hashConnect, setHashConnect] = useState<any | null>(null);
  const [state, setState] = useState<any>(0);
  const [pairingData, setPairingData] = useState<any | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Dynamic imports to prevent SSR build failures
        const { HashConnect, HashConnectConnectionState } = await import('hashconnect');
        const { LedgerId } = await import('@hashgraph/sdk');

        const appMetadata = {
          name: "HashMeme Platform",
          description: "Premium Meme Launchpad on Hedera",
          icons: ["https://dapp.example.com/logo.png"],
          url: "https://hashmeme.fun"
        };
        
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c1e7a61d8a8b2fc63d3de1e892c90c54";

        const hc = new HashConnect(
            LedgerId.TESTNET,
            projectId,
            appMetadata,
            true // show debugging
        );

        hc.connectionStatusChangeEvent.on((connectionState: any) => {
          setState(connectionState);
        });

        hc.pairingEvent.on((data: any) => {
          setPairingData(data);
          if (data && data.accountIds && data.accountIds.length > 0) {
              setAccountId(data.accountIds[0]);
          }
        });

        await hc.init();
        setHashConnect(hc);

      } catch (e) {
        console.error("Error initializing HashConnect", e);
      }
    };

    if (typeof window !== 'undefined') {
        init();
    }
  }, []);

  const connect = async () => {
    if (hashConnect) {
      await hashConnect.openPairingModal();
    }
  };

  const disconnect = async () => {
    if (hashConnect && pairingData?.topic) {
      await hashConnect.disconnect();
      setPairingData(null);
      setAccountId(null);
    }
  };

  return (
    <HashConnectContext.Provider value={{ hashConnect, state, pairingData, connect, disconnect, accountId }}>
      {children}
    </HashConnectContext.Provider>
  );
};

export const useHashConnect = () => useContext(HashConnectContext);
