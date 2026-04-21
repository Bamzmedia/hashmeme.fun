'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
import WalletConnectButton from '@/components/WalletConnectButton';

// Initialize Supabase (Public)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

interface LeaderboardEntry {
    account_id: string;
    total_swapped: number;
    total_points: number;
    tx_count: number;
    last_seen: string;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data, error } = await supabase
                    .from('rewards_leaderboard')
                    .select('*')
                    .order('total_points', { ascending: false })
                    .limit(50);

                if (error) throw error;
                if (data) setEntries(data);
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getTier = (points: number) => {
        if (points > 1000000) return { label: 'Celestial', color: 'text-purple-400' };
        if (points > 100000) return { label: 'Radiant', color: 'text-blue-400' };
        if (points > 10000) return { label: 'Elite', color: 'text-teal-400' };
        return { label: 'Initiate', color: 'text-white/40' };
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
                        <Link href="/swap" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Swap</Link>
                        <Link href="/dashboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Launchpad</Link>
                        <Link href="/leaderboard" className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-blue-500 pb-1">Leaderboard</Link>
                        <Link href="/stake" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Staking</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <WalletConnectButton />
                </div>
            </nav>

            <div className="max-w-7xl mx-auto w-full pt-48 pb-32 px-6 relative z-10 transition-all">
                
                <div className="flex flex-col items-center text-center mb-24 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-3 px-6 py-2 glow-card rounded-full text-[10px] font-bold tracking-[0.4em] uppercase text-blue-400"
                    >
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-neon-blue"></span>
                        <span>Radiant Merit System</span>
                    </motion.div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase">
                        Global<br/>Leaderboard
                    </h1>
                </div>

                <div className="glow-card rounded-[3.5rem] p-1 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Rank</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Account</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Tier</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Radiant Volume</th>
                                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-10 py-8 bg-white/5 border-b border-white/5 h-20"></td>
                                        </tr>
                                    ))
                                ) : entries.length > 0 ? (
                                    entries.map((entry, index) => {
                                        const tier = getTier(entry.total_points);
                                        return (
                                            <motion.tr 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                key={entry.account_id} 
                                                className="hover:bg-white/5 transition-colors group"
                                            >
                                                <td className="px-10 py-10">
                                                    <span className={`text-2xl font-black ${index < 3 ? 'text-blue-500 glow-text' : 'text-white/20'}`}>
                                                        #{index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-10">
                                                    <div className="font-mono text-xs font-bold select-all text-white/80">{entry.account_id}</div>
                                                </td>
                                                <td className="px-10 py-10">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}>
                                                        {tier.label}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-10 text-right">
                                                    <span className="text-lg font-black text-white/60 tracking-tight">
                                                        {entry.total_swapped.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-10 text-right">
                                                    <span className="text-xl font-black text-blue-500 glow-text-blue">
                                                        {entry.total_points.toLocaleString()}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center text-white/10 text-[10px] font-bold uppercase tracking-[0.5em]">
                                            Awaiting First Radiant Transaction...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <footer className="py-20 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.5em] mt-auto">
                &copy; 2026 GlowSwap Protocol &bull; Merit Verification Active
            </footer>
        </main>
    );
}
