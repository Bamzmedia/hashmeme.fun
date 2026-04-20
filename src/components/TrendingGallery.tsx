'use client';

import { useTrendingTokens, TokenFilter } from '@/hooks/useTrendingTokens';
import Link from 'next/link';

export default function TrendingGallery() {
    const { tokens, loading, filter, setFilter } = useTrendingTokens('all');

    return (
        <div className="w-full relative z-10">
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text tracking-tighter mb-2">Market Heat</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Live DEX & Mirror Node Data</p>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex space-x-2 mt-6 md:mt-0 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            filter === 'all' 
                            ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        All Memes
                    </button>
                    <button 
                        onClick={() => setFilter('hot')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                            filter === 'hot' 
                            ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border-indigo-400/50' 
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Hot Memes
                    </button>
                </div>
            </div>

            {/* Gallery Grid or Loading State */}
            <div className="relative min-h-[400px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Syncing Network Values...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {tokens.length > 0 ? (
                            tokens.map((token, index) => {
                                const marketCap = Number(token.total_supply) * token.priceUsd;
                                const isPositive = token.priceChange24h >= 0;

                                return (
                                    <div key={token.token_id || index} className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all duration-500 shadow-2xl overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-pink-500/0 group-hover:from-indigo-500/5 group-hover:to-pink-500/5 transition-all duration-700"></div>
                                        
                                        <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6">
                                            <div className="flex space-x-6">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/10 relative z-10 bg-black group-hover:scale-105 transition-transform duration-500 shadow-inner">
                                                        <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{token.name}</h3>
                                                        {index < 3 && (
                                                            <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">Verified</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-sm font-black text-gray-500 tracking-widest">{token.symbol}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                        <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 tracking-tighter">{token.token_id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end justify-center">
                                                <div className="w-32 h-16 flex items-end space-x-1 pb-2">
                                                    {token.priceSparkline.map((val, i) => (
                                                        <div 
                                                            key={i} 
                                                            className={`w-1.5 transition-all duration-300 rounded-full ${isPositive ? 'bg-emerald-500/30 group-hover:bg-emerald-400' : 'bg-pink-500/30 group-hover:bg-pink-400'}`} 
                                                            style={{ height: `${val}%`, minHeight: '4px' }}
                                                        ></div>
                                                    ))}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-white">
                                                        ${token.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                                                    </div>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest ${isPositive ? 'text-emerald-400' : 'text-pink-400'}`}>
                                                        {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="relative z-10 grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Market Cap</div>
                                                <div className="text-lg font-mono text-gray-300 font-bold tracking-tight">
                                                    ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                            <Link href="/swap" className="block">
                                                <button className="w-full h-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-white text-black hover:bg-indigo-500 hover:text-white transition-all shadow-xl hover:shadow-indigo-500/20">
                                                    Trade
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center text-gray-600 font-black uppercase tracking-widest border-2 border-dashed border-white/5 rounded-[3rem]">
                                No Memes Found Decoding Network...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
