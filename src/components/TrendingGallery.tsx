'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MemeAsset {
    id: string;
    token_id: string;
    name: string;
    symbol: string;
    image_url: string;
    market_cap: string;
    created_at: string;
}

export default function TrendingGallery() {
    const [assets, setAssets] = useState<MemeAsset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMemeData = async () => {
            try {
                const response = await fetch('/api/launch');
                const data = await response.json();
                setAssets(data.tokens || []);
            } catch (e) {
                console.error("Failed to fetch HTS assets");
            } finally {
                setLoading(false);
            }
        };
        fetchMemeData();
    }, []);

    return (
        <div className="w-full">
            <div className="space-y-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 glass animate-pulse rounded-[2rem]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {assets.length > 0 ? (
                            assets.map((asset) => {
                                const marketCap = parseFloat(asset.market_cap) || 0;
                                return (
                                    <div 
                                        key={asset.id} 
                                        className="frosted p-8 rounded-[2rem] hover:shadow-neon-blue transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                                        
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-20 h-20 bg-[#0a0c10] border border-white/10 overflow-hidden flex items-center justify-center p-1">
                                                    {asset.image_url ? (
                                                        <img src={asset.image_url} alt={asset.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-blue-500 font-black text-xl">{asset.symbol[0]}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase tracking-tighter">{asset.name}</h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{asset.symbol}</span>
                                                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                                        <span className="text-[10px] font-mono text-blue-500">{asset.token_id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/5">
                                            <div>
                                                <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-1">Market Cap</div>
                                                <div className="text-xl font-black tracking-tight">
                                                    ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                            <Link href="/swap" className="block">
                                                <button className="w-full h-full py-4 bg-white text-black hover:bg-blue-500 hover:text-white font-black text-[9px] uppercase tracking-[0.3em] transition-all shadow-neon-blue">
                                                    Trade
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 bg-white/5 rounded-[3rem]">
                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">Awaiting Token Launch Consensus...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
