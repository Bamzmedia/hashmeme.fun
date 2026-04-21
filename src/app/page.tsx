'use client';

import { useState, useEffect } from 'react';
import WalletConnectButton from '@/components/WalletConnectButton';
import Link from 'next/link';
import TrendingGallery from '@/components/TrendingGallery';
import TradeFeed from '@/components/TradeFeed';
import CommunityChat from '@/components/CommunityChat';
import { MirrorNodeService } from '@/services/MirrorNodeService';

export default function Home() {
    const [stats, setStats] = useState({ dailySwaps: '...', htsGrowth: '...' });

    useEffect(() => {
        const fetchStats = async () => {
            const mirror = MirrorNodeService.getInstance();
            const realStats = await mirror.getGlobalStats();
            setStats({
                dailySwaps: realStats.dailySwaps >= 1000 ? `${(realStats.dailySwaps / 1000).toFixed(1)}K` : realStats.dailySwaps.toString(),
                htsGrowth: `${realStats.htsGrowth.toFixed(1)}%`
            });
        };
        fetchStats();
    }, []);

    const scrollToMarket = () => {
        document.getElementById('market-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-[#05070a] text-white flex flex-col font-sans selection:bg-blue-500 selection:text-white">
            
            {/* TOP NAVIGATION BAR (Mirrored from Swap) */}
            <nav className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-black/40 backdrop-blur-md z-50 px-8 flex items-center justify-between">
                <div className="flex items-center space-x-12">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="w-8 h-8 border-2 border-blue-500 group-hover:rotate-45 transition-transform duration-500 flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-500"></div>
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase">HashMeme / HUB</span>
                    </Link>
                    
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/swap" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Swap</Link>
                        <Link href="/dashboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Launchpad</Link>
                        <Link href="/stake" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Staking</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <WalletConnectButton />
                </div>
            </nav>

            {/* AMBIENT BACKGROUND GLOWS */}
            <div className="fixed top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-600/5 blur-[200px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-1/4 right-1/4 w-[800px] h-[800px] bg-white/5 blur-[150px] rounded-full pointer-events-none"></div>

            {/* ENTRANCE HERO */}
            <section className="h-screen flex flex-col items-center justify-center px-6 relative z-10 pt-20">
                <div className="text-center max-w-5xl space-y-12">
                    <div className="inline-flex items-center space-x-3 px-6 py-2 glass rounded-full text-[10px] font-bold tracking-[0.4em] uppercase text-blue-400">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                        <span>Protocol v2.0 Live</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-[9rem] font-black tracking-tighter leading-none">
                        HASHMEME<span className="text-blue-500">.</span>FUN
                    </h1>

                    <p className="text-xs md:text-sm text-white/30 max-w-xl mx-auto font-bold tracking-[0.3em] uppercase leading-loose">
                        Institutional Grade Infrastructure for <br/> 
                        Verified Ledger Asset Distribution
                    </p>

                    <div className="flex flex-col items-center justify-center pt-8 gap-12">
                        <div className="p-1 glass rounded-full">
                            <WalletConnectButton />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button 
                                onClick={scrollToMarket}
                                className="w-full sm:w-auto px-16 py-6 border-2 border-blue-500 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-neon-blue"
                            >
                                Explore Market
                            </button>
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-16 py-6 border border-white/10 text-white/30 font-black text-[10px] uppercase tracking-[0.3em] hover:border-white hover:text-white transition-all">
                                    Create Asset
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* Scroll Indicator */}
                <div className="absolute bottom-10 animate-bounce transition-opacity opacity-20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
            </section>

            {/* DASHBOARD SECTION */}
            <section id="market-section" className="max-w-[1700px] mx-auto w-full px-8 py-32 flex flex-col lg:flex-row gap-16 relative z-10">
                
                {/* Main Content Area */}
                <div className="flex-grow flex flex-col space-y-16">
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Verified Trending</h2>
                        <div className="w-20 h-1 bg-blue-500 shadow-neon-blue"></div>
                    </div>
                    <TrendingGallery />
                </div>

                {/* Sidebar Content */}
                <aside className="w-full lg:w-[450px] flex flex-col space-y-12">
                    {/* GLASS STATS */}
                    <div className="glass p-10 space-y-10 rounded-[3rem] shadow-neon-blue-lg">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Protocol Velocity (24H)</h3>
                            <div className="text-5xl font-black tracking-tighter">{stats.dailySwaps}</div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-blue-500 shadow-neon-blue animate-pulse"></div>
                            </div>
                        </div>
                        <div className="pt-10 border-t border-white/5 space-y-4">
                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">HTS Network Dominance</h3>
                            <div className="text-5xl font-black tracking-tighter text-blue-500">{stats.htsGrowth}</div>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">Live Consensus Validation</p>
                        </div>
                    </div>

                    {/* LIVE DATA FEEDS */}
                    <div className="flex-grow flex flex-col space-y-12">
                        <TradeFeed />
                        <CommunityChat />
                    </div>

                    <div className="pt-10 border-t border-white/5 text-center">
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em]">Nodes Connected: 0.0.3 // 0.0.5</p>
                    </div>
                </aside>
            </section>

            <footer className="py-32 border-t border-white/5 text-center text-white/10 text-[10px] font-black uppercase tracking-[0.6em]">
                &copy; 2026 HashMeme Protocol &bull; Secure Ledger Execution
            </footer>
        </main>
    );
}
