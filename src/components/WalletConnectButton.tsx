'use client';

import { useHashConnect } from '../context/HashConnectProvider';

export default function WalletConnectButton() {
  const { connect, disconnect, accountId, state } = useHashConnect();

  const isConnected = state === 'Connected';

  const formatAccountId = (id: string) => {
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  if (isConnected && accountId) {
    return (
      <button 
        onClick={disconnect}
        className="px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
      >
        {formatAccountId(accountId)} (Disconnect)
      </button>
    );
  }

  return (
    <button 
      onClick={connect}
      className="px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]"
    >
      Connect HashPack
    </button>
  );
}
