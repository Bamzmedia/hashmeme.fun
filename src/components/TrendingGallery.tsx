'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BondingProgress from './BondingProgress';

interface MemeAsset {
    id: string;
    token_id: string;
    name: string;
    symbol: string;
    image_url: string;
    market_cap: string;
    created_at: string;
    hbar_collected?: string; // We'll mock/fetch this based on market activity
}

export default function TrendingGallery() {
    const [assets, setAssets] = useState<MemeAsset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchMemeData = async () => {
            try {
                const response = await fetch('/api/launch');
                const data = await response.json();
                
                // Add mocked hbar_collected for visualization if missing
                const mapped = (data.tokens || []).map((t: any) => ({
                    ...t,
                    hbar_collected: t.hbar_collected || (Math.random() * 45000).toString() 
                }));
                
                setAssets(mapped);
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
                            <div key={i} className="h-64 frosted animate-pulse rounded-[2rem]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {assets.length > 0 ? (
                            assets.map((asset) => {
                                const marketCap = parseFloat(asset.market_cap) || 0;
                                const hbarCollected = parseFloat(asset.hbar_collected || '0');
                                
                                return (
                                    <div 
                                        key={asset.id} 
                                        className="frosted p-10 rounded-[2.5rem] hover:shadow-neon-blue transition-all group relative overflow-hidden flex flex-col"
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                                        
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-24 h-24 frosted border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-1">
                                                    {asset.image_url ? (
                                                        <img src={asset.image_url} alt={asset.name} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <div className="text-blue-500 font-black text-2xl uppercase">{asset.symbol[0]}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter">{asset.name}</h3>
                                                    <div className="flex items-center space-x-3 mt-1">
                                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{asset.symbol}</span>
                                                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                                        <span className="text-[10px] font-mono text-blue-400 font-bold">{asset.token_id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BONDING ANALYTICS */}
                                        <div className="mb-10 p-6 bg-black/40 rounded-2xl border border-white/5">
                                            <BondingProgress currentHbar={hbarCollected} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 mt-auto pt-8 border-t border-white/5">
                                            <div>
                                                <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-1">Market Saturation</div>
                                                <div className="text-2xl font-black tracking-tight">
                                                    ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                            <Link href="/swap" className="block">
                                                <button className="w-full h-full py-5 bg-white text-black hover:bg-blue-500 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-neon-blue active:scale-95">
                                                    Open Trade
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-32 text-center frosted rounded-[3rem]">
                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">Awaiting Token Launch Consensus...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
