'use client';

import { useWallet } from '@/context/WalletContext';
import { useState } from 'react';

export default function WalletConnectButton() {
    const { accountId, isConnected, connect, disconnect } = useWallet();
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            await connect();
        } finally {
            setLoading(false);
        }
    };

    if (isConnected && accountId) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
                    {accountId.length > 12 ? `${accountId.slice(0, 8)}...${accountId.slice(-4)}` : accountId}
                </span>
                <button
                    onClick={disconnect}
                    className="px-4 py-2 text-[10px] rounded-full font-bold text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all uppercase tracking-widest"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            className="px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50"
        >
            {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
}
