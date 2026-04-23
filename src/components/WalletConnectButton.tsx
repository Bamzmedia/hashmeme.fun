'use client';

import { useWallet } from '@/context/WalletContext';

export default function WalletConnectButton() {
    const { accountId, isConnected, connect, disconnect } = useWallet();

    if (isConnected && accountId) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full uppercase tracking-tighter">
                    {accountId}
                </span>
                <button
                    onClick={disconnect}
                    className="px-4 py-2 text-[10px] rounded-full font-bold text-white/40 hover:text-red-400 border border-white/10 transition-all uppercase tracking-widest"
                >
                    Exit
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400 shadow-[0_0_25px_rgba(79,70,229,0.5)] transform active:scale-95"
        >
            Connect Wallet
        </button>
    );
}
