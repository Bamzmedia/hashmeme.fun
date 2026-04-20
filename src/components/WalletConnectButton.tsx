'use client';

import { useAppKit } from '@reown/appkit/react';
import { useDisconnect } from 'wagmi';
import { useHederaAccount } from '../hooks/useHederaAccount';

export default function WalletConnectButton() {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { accountId, isConnected, isResolving } = useHederaAccount();

  const formatAccountId = (id: string) => {
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <button 
        onClick={() => open()}
        className="px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
      >
        {isResolving ? 'Resolving...' : (accountId || 'Connected')}
      </button>
    );
  }

  return (
    <button 
      onClick={() => open()}
      className="px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]"
    >
      Connect Wallet
    </button>
  );
}
