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
    <main className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* ENTRANCE HERO: CENTRALIZED BRANDING */}
      <section className="h-screen flex flex-col items-center justify-center px-6 border-b border-white/10">
          <div className="text-center max-w-5xl space-y-12">
              <div className="inline-block border border-white/20 rounded-full px-6 py-2 text-[10px] font-bold tracking-[0.4em] uppercase">
                  Hash Mapped Ledger Launchpad
              </div>
              
              <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none">
                  HASHMEME.FUN
              </h1>

              <p className="text-sm md:text-lg text-white/50 max-w-xl mx-auto font-medium tracking-tight">
                  A high-fidelity infrastructure for launching and trading 
                  verified assets on the Hedera network.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <button 
                      onClick={scrollToMarket}
                      className="w-full sm:w-auto px-12 py-5 border-2 border-white text-white font-bold text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                  >
                      Explore Market
                  </button>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto px-12 py-5 border border-white/20 text-white/60 font-bold text-xs uppercase tracking-[0.3em] hover:border-white hover:text-white transition-all">
                          Create Asset
                      </button>
                  </Link>
              </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 animate-bounce">
              <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
          </div>
      </section>

      {/* DASHBOARD SECTION: SIDEBAR LAYOUT */}
      <section id="market-section" className="max-w-[1600px] mx-auto w-full px-6 py-24 flex flex-col lg:flex-row gap-12">
        
        {/* Main Content Area */}
        <div className="flex-grow flex flex-col space-y-12">
            <TrendingGallery />
        </div>

        {/* Sidebar Content */}
        <aside className="w-full lg:w-[400px] flex flex-col space-y-8">
            {/* CENTRALIZED STATS */}
            <div className="border border-white/10 p-8 text-center space-y-8">
                <div>
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">24H Network Energy</h3>
                    <div className="text-4xl font-black">{stats.dailySwaps}</div>
                    <div className="text-[9px] text-white/30 uppercase mt-2">Successful Swaps</div>
                </div>
                <div className="pt-8 border-t border-white/5">
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">HTS Alpha Growth</h3>
                    <div className="text-4xl font-black text-white">{stats.htsGrowth}</div>
                    <div className="text-[9px] text-white/30 uppercase mt-2">Verified Ledger Sync</div>
                </div>
            </div>

            {/* LIVE DATA FEEDS */}
            <div className="flex-grow flex flex-col space-y-8">
                <TradeFeed />
                <CommunityChat />
            </div>

            <div className="pt-8 flex justify-center">
                <WalletConnectButton />
            </div>
        </aside>
      </section>

      <footer className="py-20 border-t border-white/5 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">
          &copy; 2026 HashMeme &bull; Ledger Focused Branding
      </footer>
    </main>
  );
}
