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

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 mix-blend-overlay pointer-events-none z-0"></div>
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-[1600px] mx-auto w-full px-6 pt-16 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Main Dashboard */}
        <div className="flex-grow flex flex-col space-y-8">
            
            {/* HER0 / INTRO */}
            <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                
                <div className="max-w-2xl relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Premium Launchpad</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                        HashMeme <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">Revolution</span>
                    </h1>
                    
                    <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed font-medium">
                        The ultimate high-fidelity meme token launchpad on Hedera. Seamlessly mint, trade, and track the next moonshot with institutional-grade speed.
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <WalletConnectButton />
                        <Link href="/dashboard">
                            <button className="px-10 py-3.5 rounded-full font-bold text-md bg-white text-black hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                                Enter Launchpad
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* MAIN GALLERY */}
            <section>
                <TrendingGallery />
            </section>
        </div>

        {/* RIGHT COLUMN: Sidebar (Trade Feed & Chat) */}
        <aside className="w-full lg:w-[400px] flex flex-col space-y-8">
            {/* STATS OVERVIEW */}
            <div className="bg-black/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl group">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Market Stats</h3>
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Live Ledger</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-all duration-500">
                        <div className="text-2xl font-black text-white">{stats.dailySwaps}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-black mt-1">24H Consensus</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-emerald-500/30 transition-all duration-500">
                        <div className={`text-2xl font-black ${parseFloat(stats.htsGrowth) > 0 ? 'text-emerald-400' : 'text-white'}`}>{stats.htsGrowth}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-black mt-1">HTS Velocity</div>
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

      <footer className="relative z-10 py-16 text-center text-gray-600 text-xs font-bold uppercase tracking-[0.2em]">
          &copy; 2026 HashMeme Platform &bull; Built for Hedera
      </footer>
    </main>
  );
}
