'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BondingProgress from './BondingProgress';
import { SecurityBadge, ReactionButton } from './CommunityAssets';

interface MemeAsset {
    id: string;
    token_id: string;
    name: string;
    symbol: string;
    image_url: string;
    market_cap: string;
    created_at: string;
    hbar_collected?: string;
    is_locked?: boolean;
    reactions?: { fire: number; rocket: number };
}

export default function TrendingGallery() {
    const [assets, setAssets] = useState<MemeAsset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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

    useEffect(() => {
        fetchMemeData();
    }, []);

    const handleReact = async (id: string, type: 'fire' | 'rocket') => {
        try {
            const res = await fetch('/api/react', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, reactionType: type })
            });
            if (res.ok) {
                // Optimistic UI update
                setAssets(prev => prev.map(asset => {
                    if (asset.id === id) {
                        const newReactions = { ...asset.reactions };
                        if (type === 'fire') newReactions.fire = (newReactions.fire || 0) + 1;
                        return { ...asset, reactions: newReactions };
                    }
                    return asset;
                }));
            }
        } catch (e) {
            console.error("Reaction failed");
        }
    };

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
                                const hbarCollected = parseFloat(asset.hbar_collected || '0');
                                
                                return (
                                    <div 
                                        key={asset.id} 
                                        className="frosted p-10 rounded-[2.5rem] hover:shadow-neon-blue transition-all group relative overflow-hidden flex flex-col"
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl"></div>
                                        
                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-24 h-24 frosted border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-black/20">
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
                                            <SecurityBadge isLocked={!!asset.is_locked} />
                                        </div>

                                        <div className="mb-10 p-6 bg-black/40 rounded-2xl border border-white/5 relative z-10">
                                            <BondingProgress currentHbar={hbarCollected} />
                                        </div>

                                        <div className="flex justify-between items-center mt-auto pt-8 border-t border-white/5 relative z-10">
                                            <div className="flex items-center space-x-4">
                                                <ReactionButton 
                                                    id={asset.id} 
                                                    count={asset.reactions?.fire || 0} 
                                                    onReact={() => handleReact(asset.id, 'fire')} 
                                                />
                                            </div>
                                            <Link href="/swap" className="block w-40">
                                                <button className="w-full py-4 bg-white text-black hover:bg-blue-500 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-neon-blue active:scale-95">
                                                    Trade
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-32 text-center frosted rounded-[3rem]">
                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">Awaiting Consensus...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
