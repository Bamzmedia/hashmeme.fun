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

  const scrollToGallery = () => {
      document.getElementById('market-gallery')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay pointer-events-none z-0"></div>
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-[1600px] mx-auto w-full px-6 pt-10 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Main Dashboard */}
        <div className="flex-grow flex flex-col space-y-8">
            
            {/* NEW HERO: DEGEN EDITION */}
            <section className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 md:p-16 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                {/* Floating Decorative Elements (Native Animation) */}
                <div className="absolute top-10 right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-bounce [animation-duration:5s]"></div>
                
                <div className="max-w-3xl relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 hover:bg-white/10 transition-colors cursor-default group/badge">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">No Cap Logic</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Verified Degen Engine</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.95] group-hover:scale-[1.01] transition-transform duration-700">
                        Turn Your <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            Brain-Rot
                        </span> <br />
                        Into Real Rewards.
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-xl leading-relaxed font-medium">
                        The fastest, degen-friendly launchpad for turning absolute nonsense into units of value. No complex tech, just pure moon-math on Hedera.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <button 
                            onClick={scrollToGallery}
                            className="w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] bg-white text-black hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-indigo-500/40"
                        >
                            Start Trading
                        </button>
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all">
                                Create Meme Token
                            </button>
                        </Link>
                        <div className="hidden xl:block">
                            <WalletConnectButton />
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN GALLERY */}
            <section>
                <TrendingGallery />
            </section>
        </div>

        {/* RIGHT COLUMN: Sidebar (Trade Feed & Chat) */}
        <aside className="w-full lg:w-[380px] flex flex-col space-y-8">
            {/* STATS OVERVIEW */}
            <div className="bg-black/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl group">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Sinks</h3>
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Deflation Active</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-all duration-500 text-center">
                        <div className="text-xl font-black text-white">{stats.dailySwaps}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-black mt-1">24H Swaps</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-emerald-500/30 transition-all duration-500 text-center">
                            <div className={`text-xl font-black ${parseFloat(stats.htsGrowth) > 0 ? 'text-emerald-400' : 'text-white'}`}>{stats.htsGrowth}</div>
                            <div className="text-[9px] text-gray-500 uppercase font-black mt-1">HTS Alpha</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-pink-500/30 transition-all duration-500 text-center">
                            <div className="text-xl font-black text-pink-400">1.2%</div>
                            <div className="text-[9px] text-gray-500 uppercase font-black mt-1">Supply Burned</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TRADE FEED */}
            <div className="flex-grow flex flex-col min-h-[500px]">
                <TradeFeed />
            </div>

            {/* REAL-TIME COMMUNITY CHAT */}
            <CommunityChat />
        </aside>
      </div>

      <footer className="relative z-10 py-16 text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; 2026 HashMeme Platform &bull; Built for Moon Missions
      </footer>
    </main>
  );
}
