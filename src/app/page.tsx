'use client';

import { useState, useEffect } from 'react';
import WalletConnectButton from '@/components/WalletConnectButton';
import Link from 'next/link';
import TrendingGallery from '@/components/TrendingGallery';
import TradeFeed from '@/components/TradeFeed';
import CommunityChat from '@/components/CommunityChat';
import { MirrorNodeService } from '@/services/MirrorNodeService';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMesh from '@/components/effects/BackgroundMesh';

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
        <main className="min-h-screen bg-[#05070a] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white relative">
            
            <BackgroundMesh />

            {/* TOP NAVIGATION BAR */}
            <nav className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-black/40 backdrop-blur-md z-50 px-8 flex items-center justify-between">
                <div className="flex items-center space-x-12">
                    <Link href="/" className="flex items-center space-x-3 group outline-none">
                        <div className="p-1 rounded-sm border border-blue-500 group-hover:rotate-45 transition-transform duration-500 flex items-center justify-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 shadow-neon-blue"></div>
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase glow-text">GlowSwap / HUB</span>
                    </Link>
                    
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/swap" className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-blue-500 pb-1">Swap</Link>
                        <Link href="/dashboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Launchpad</Link>
                        <Link href="/leaderboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Leaderboard</Link>
                        <Link href="/stake" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Staking</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <WalletConnectButton />
                </div>
            </nav>

            {/* ENTRANCE HERO */}
            <section className="h-screen flex flex-col items-center justify-center px-6 relative z-10 pt-20">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center max-w-5xl space-y-10"
                >
                    <div className="inline-flex items-center space-x-3 px-6 py-2 glow-card rounded-full text-[10px] font-bold tracking-[0.4em] uppercase text-blue-400">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-neon-blue"></span>
                        <span>Protocol v2.5 Active</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-[9.5rem] font-black tracking-tighter leading-none uppercase">
                        GlowSwap<span className="text-purple-500 glow-text-purple">.</span>
                    </h1>

                    <p className="text-xs md:text-sm text-white/40 max-w-xl mx-auto font-black tracking-[0.4em] uppercase leading-loose glow-text">
                        The Radiant Hub for Hedera <br/> 
                        Memes & Liquidity Staking
                    </p>

                    <div className="flex flex-col items-center justify-center pt-10 gap-14">
                        <div className="p-1 rounded-full bg-white/5 border border-white/10 shadow-radiant">
                            <WalletConnectButton />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-4xl px-6">
                            <button 
                                onClick={scrollToMarket}
                                className="w-full px-12 py-6 border border-blue-500/50 text-white font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-500 hover:border-blue-500 transition-all shadow-radiant bg-blue-500/10 active:scale-95 text-center"
                            >
                                Explore Radiant Market
                            </button>
                            <Link 
                                href="/dashboard" 
                                className="w-full px-12 py-6 border border-white/10 text-white/30 font-black text-[10px] uppercase tracking-[0.4em] hover:border-purple-500/50 hover:text-purple-400 transition-all hover:bg-purple-500/5 active:scale-95 text-center flex items-center justify-center"
                            >
                                Launch New Asset
                            </Link>
                            <Link 
                                href="/leaderboard" 
                                className="w-full px-12 py-6 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] hover:border-blue-500 hover:bg-blue-500/5 transition-all shadow-radiant active:scale-95 text-center flex items-center justify-center"
                            >
                                View Leaderboard
                            </Link>
                        </div>
                    </div>
                </motion.div>
                
                <div className="absolute bottom-10 animate-bounce transition-opacity opacity-20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
            </section>

            {/* DASHBOARD SECTION */}
            <section id="market-section" className="max-w-[1700px] mx-auto w-full px-8 py-32 flex flex-col lg:flex-row gap-16 relative z-10">
                
                {/* Main Content Area */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex-grow flex flex-col space-y-16"
                >
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-3xl font-black uppercase tracking-tighter glow-text">Radiant Trending</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 shadow-radiant"></div>
                    </div>
                    <TrendingGallery />
                </motion.div>

                {/* Sidebar Content */}
                <aside className="w-full lg:w-[450px] flex flex-col space-y-12">
                    {/* GLOW STATS */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glow-card p-10 space-y-10 rounded-[3rem]"
                    >
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest relative z-10">Protocol Velocity (24H)</h3>
                            <div className="text-5xl font-black tracking-tighter relative z-10 glow-text">{stats.dailySwaps}</div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/5">
                                <div className="w-2/3 h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-radiant animate-pulse"></div>
                            </div>
                        </div>
                        <div className="pt-10 border-t border-white/5 space-y-4 relative z-10">
                            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">HTS Network Dominance</h3>
                            <div className="text-5xl font-black tracking-tighter text-blue-500 glow-text">{stats.htsGrowth}</div>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">Verified Hub Statistics</p>
                        </div>
                    </motion.div>

                    {/* LIVE DATA FEEDS */}
                    <div className="flex-grow flex flex-col space-y-12">
                        <TradeFeed />
                        <CommunityChat />
                    </div>

                    <div className="pt-10 border-t border-white/5 text-center">
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em]">Hub Synchronization Active: 0.0.5</p>
                    </div>
                </aside>
            </section>

            <footer className="py-32 border-t border-white/5 text-center text-white/10 text-[10px] font-black uppercase tracking-[0.6em]">
                &copy; 2026 GlowSwap Protocol &bull; Radiant Ledger Execution
            </footer>
        </main>
    );
}
