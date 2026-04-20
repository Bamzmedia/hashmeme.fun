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
        <div className="w-full max-w-7xl mx-auto py-16 px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text tracking-tight mb-2">Trending Memes</h2>
                    <p className="text-gray-400 text-lg">The hottest launches on the Hedera network right now.</p>
                </div>
            </div>

            {/* Static 3-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tokens.map((token, index) => (
                    <div key={token.token_id || index} className="bg-black/40 border border-white/5 rounded-[2rem] p-6 hover:bg-white/5 transition-all duration-300 backdrop-blur-xl group hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_40px_rgba(79,70,229,0.15)]">
                        <div className="flex space-x-5 items-center mb-6">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-colors shadow-inner">
                                <img src={token.image} alt={token.symbol} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://grainy-gradients.vercel.app/noise.svg")} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{token.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm font-bold text-gray-500">{token.symbol}</span>
                                    <span className="text-xs font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded-md border border-white/10">{token.token_id}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-900/50 rounded-2xl p-4 mb-6 border border-white/5">
                            <div className="text-xs text-gray-500 mb-1 font-medium">Total Supply</div>
                            <div className="text-lg font-mono text-gray-300 font-bold bg-gradient-to-r from-gray-200 to-gray-400 text-transparent bg-clip-text">
                                {Number(token.total_supply).toLocaleString()}
                            </div>
                        </div>

                        <Link href="/swap">
                            <button className="w-full py-4 rounded-xl font-bold text-sm bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20 shadow-sm">
                                Trade {token.symbol}
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
