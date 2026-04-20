'use client';

import { useTradeFeed } from '@/hooks/useTradeFeed';

export default function TradeFeed() {
    const { trades } = useTradeFeed();

    return (
        <div className="w-full max-w-md mx-auto lg:max-w-sm lg:ml-auto bg-black/40 border border-white/10 rounded-[2rem] p-5 md:p-6 backdrop-blur-xl h-[450px] md:h-[600px] flex flex-col relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-white/10">
                <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mr-3 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                    Live Trades Feed
                </h3>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {trades.map((trade) => (
                    <div key={trade.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all animate-fade-in-up">
                        <div className="flex justify-between items-center mb-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-lg tracking-wider ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                                {trade.type}
                            </span>
                            <span className="text-xs text-gray-500 font-mono font-medium">
                                {trade.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-xl font-bold text-white tracking-tight">
                                    {Number(trade.amount).toLocaleString()} <span className="text-sm font-medium text-gray-400">{trade.tokenSymbol}</span>
                                </div>
                                <div className="text-xs text-gray-600 font-mono mt-1.5 hover:text-indigo-400 cursor-pointer transition-colors" title="View on Hashscan">
                                    tx: {trade.txId}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white flex items-center justify-end space-x-1">
                                    <span className="text-indigo-400 font-serif italic text-lg leading-none">ℏ</span>
                                    <span>{trade.hbarValue}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
