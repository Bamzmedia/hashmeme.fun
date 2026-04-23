'use client';

import { useWallet } from '@/context/WalletContext';

export default function WalletConnectButton() {
    const { accountId, isConnected, isPairing, isInitializing, error, connect, disconnect } = useWallet();

    const shortId = accountId
        ? accountId.length > 12 ? `${accountId.slice(0, 8)}...${accountId.slice(-4)}` : accountId
        : null;

    if (isInitializing) {
        return (
            <button
                disabled
                className="px-6 py-2 rounded-full font-semibold text-sm bg-white/5 text-white/20 border border-white/5 animate-pulse"
            >
                Connect Wallet
            </button>
        );
    }

    if (error) {
        return (
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-full font-semibold text-sm bg-red-500/10 text-red-500 border border-red-500/20"
            >
                Connect Wallet (Retry)
            </button>
        );
    }

    if (isConnected && accountId) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
                    {shortId}
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
            onClick={connect}
            disabled={isPairing}
            className="px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] disabled:opacity-50"
        >
            {isPairing ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
}
