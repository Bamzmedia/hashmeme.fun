'use client';

import { useTrendingTokens, TokenFilter } from '@/hooks/useTrendingTokens';
import Link from 'next/link';

export default function TrendingGallery() {
    const { tokens, loading, filter, setFilter } = useTrendingTokens('all');

    return (
        <div id="market-gallery" className="w-full relative z-10">
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-white/10 pb-10">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">MARKET GALLERY</h1>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.4em]">Verified Ledger Sync</p>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex bg-white/5 border border-white/10 p-1 mt-6 md:mt-0">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            filter === 'all' 
                            ? 'bg-white text-black' 
                            : 'text-white/40 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('hot')}
                        className={`px-8 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                            filter === 'hot' 
                            ? 'bg-white text-black' 
                            : 'text-white/40 hover:text-white'
                        }`}
                    >
                        Hot
                    </button>
                </div>
            </div>

            {/* Gallery Grid or Loading State */}
            <div className="relative min-h-[400px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">Syncing Ledger...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {tokens.length > 0 ? (
                            tokens.map((token, index) => {
                                const marketCap = Number(token.total_supply) * token.priceUsd;
                                const isPositive = token.priceChange24h >= 0;

                                return (
                                    <div key={token.token_id || index} className="group relative bg-white/5 border border-white/10 p-10 hover:border-white transition-all duration-500 overflow-hidden">
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-all duration-700"></div>
                                        
                                        <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6">
                                             <div className="flex space-x-6">
                                                <div className="relative">
                                                    <div className="w-24 h-24 overflow-hidden border border-white/10 relative z-10 bg-black group-hover:scale-105 transition-transform duration-500">
                                                        <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="text-2xl font-black text-white">{token.name}</h3>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-sm font-bold text-white/40 tracking-widest">{token.symbol}</span>
                                                        <span className="w-1 h-1 bg-white/20"></span>
                                                        <span className="text-[10px] font-mono text-white/20 bg-white/5 px-2 py-0.5 border border-white/10 tracking-tighter">{token.token_id}</span>
                                                    </div>
                                                </div>
                                            </div>

                                             <div className="flex flex-col items-end justify-center">
                                                <div className="w-32 h-16 flex items-end space-x-1 pb-2">
                                                    {token.priceSparkline.map((val, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="w-1.5 transition-all duration-300 bg-white/10 group-hover:bg-white" 
                                                            style={{ height: `${val}%`, minHeight: '4px' }}
                                                        ></div>
                                                    ))}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-white">
                                                        ${token.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                                                    </div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                                        {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                                                                <div className="relative z-10 grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                                            <div className="p-4 bg-white/5 border border-white/10">
                                                <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Market Cap</div>
                                                <div className="text-lg font-mono text-white/80 font-bold tracking-tight">
                                                    ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                            <Link href="/swap" className="block">
                                                <button className="w-full h-full py-4 border border-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
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
