'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { HashConnect, SessionData, HashConnectConnectionState } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

interface HashConnectContextType {
  hashConnect: HashConnect | null;
  state: HashConnectConnectionState;
  pairingData: SessionData | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  accountId: string | null;
}

const HashConnectContext = createContext<HashConnectContextType>({
  hashConnect: null,
  state: HashConnectConnectionState.Disconnected,
  pairingData: null,
  connect: async () => {},
  disconnect: async () => {},
  accountId: null,
});

export const HashConnectProvider = ({ children }: { children: ReactNode }) => {
  const [hashConnect, setHashConnect] = useState<HashConnect | null>(null);
  const [state, setState] = useState<HashConnectConnectionState>(HashConnectConnectionState.Disconnected);
  const [pairingData, setPairingData] = useState<SessionData | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    let hc: HashConnect;

    const init = async () => {
      try {
        const appMetadata = {
          name: "HashMeme Platform",
          description: "Premium Meme Launchpad on Hedera",
          icons: ["https://dapp.example.com/logo.png"],
          url: "https://hashmeme.fun"
        };
        // Use an environment variable for WalletConnect ID, default placeholder if absent
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c1e7a61d8a8b2fc63d3de1e892c90c54";

        hc = new HashConnect(
            LedgerId.TESTNET,
            projectId,
            appMetadata,
            true // show debugging
        );

        hc.connectionStatusChangeEvent.on((connectionState) => {
          setState(connectionState);
        });

        hc.pairingEvent.on((data) => {
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
    if (hashConnect && (pairingData as any)?.topic) {
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
