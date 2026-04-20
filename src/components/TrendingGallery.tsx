'use client';

import { useTrendingTokens } from '@/hooks/useTrendingTokens';
import Link from 'next/link';

export default function TrendingGallery() {
    const { tokens, loading } = useTrendingTokens();

    if (loading) {
        return (
            <div className="w-full py-20 flex justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="w-full relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text tracking-tighter mb-2">Market Heat</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Trending assets on Hedera</p>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                    <button className="px-5 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest border border-white/5 text-gray-400">All</button>
                    <button className="px-5 py-2 rounded-xl bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20">Hot</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tokens.map((token, index) => (
                    <div key={token.token_id || index} className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all duration-500 shadow-2xl overflow-hidden">
                        {/* Interactive Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-pink-500/0 group-hover:from-indigo-500/5 group-hover:to-pink-500/5 transition-all duration-700"></div>
                        
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6">
                            <div className="flex space-x-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/10 relative z-10 bg-black group-hover:scale-105 transition-transform duration-500">
                                        <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{token.name}</h3>
                                        <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">Newest</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-black text-gray-500 tracking-widest">{token.symbol}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                        <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 tracking-tighter">{token.token_id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* SPARKLINE (SVG) */}
                            <div className="flex flex-col items-end justify-center">
                                <div className="w-32 h-16 flex items-end space-x-1 pb-2">
                                    {token.priceSparkline.map((val, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1.5 bg-indigo-500/30 group-hover:bg-indigo-400 transition-all duration-300 rounded-full" 
                                            style={{ height: `${val}%`, minHeight: '4px' }}
                                        ></div>
                                    ))}
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-white">$0.00042</div>
                                    <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">+12.4%</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Market Cap</div>
                                <div className="text-lg font-mono text-gray-300 font-bold tracking-tight">
                                    ${(Number(token.total_supply) * 0.0001).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </div>
                            </div>
                            <Link href="/swap" className="block">
                                <button className="w-full h-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-white text-black hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                                    Trade
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
