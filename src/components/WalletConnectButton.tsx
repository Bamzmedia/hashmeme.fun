'use client';

import { useWallet } from '@/context/WalletContext';
import { useState } from 'react';

export default function WalletConnectButton() {
    const { accountId, isConnected, connect, disconnect } = useWallet();
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        if (loading) return;
        setLoading(true);
        console.log("[Button] Initializing connection...");
        try {
            await connect();
            // We don't set loading false here because we're waiting for the pairingEvent
        } catch (e) {
            console.error("[Button] Connect failed", e);
        } finally {
            // Only set loading false after a timeout so the UI doesn't flicker
            setTimeout(() => setLoading(false), 2000);
        }
    };

    if (isConnected && accountId) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
                        {accountId}
                    </span>
                </div>
                <button
                    onClick={disconnect}
                    className="px-4 py-1.5 text-[9px] rounded-full font-bold text-white/40 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all uppercase tracking-[0.2em]"
                >
                    Exit Hub
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            className="px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-500 bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400 shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:animate-pulse"
        >
            {loading ? 'Initializing...' : 'Connect Wallet'}
        </button>
    );
}
