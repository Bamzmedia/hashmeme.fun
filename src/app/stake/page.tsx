'use client';

import { useState, useEffect } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import WalletConnectButton from '@/components/WalletConnectButton';
import BackButton from '@/components/BackButton';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function StakePage() {
    const { accountId, isConnected } = useHederaAccount();
    const [stakeAmount, setStakeAmount] = useState<string>('');
    const [stakedBalance, setStakedBalance] = useState<string>('0');
    const [pendingRewards, setPendingRewards] = useState<string>('0.00');
    const [status, setStatus] = useState<string>('');
    
    // Simulate reward accrual
    useEffect(() => {
        if (Number(stakedBalance) > 0) {
            const interval = setInterval(() => {
                setPendingRewards(prev => (Number(prev) + (Number(stakedBalance) * 0.0001)).toFixed(4));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [stakedBalance]);

    const handleStake = async () => {
        if (!isConnected) return;
        setStatus('Approving Transfer to Radiant Core...');
        await new Promise(r => setTimeout(r, 1500));
        setStakedBalance(prev => (Number(prev) + Number(stakeAmount)).toString());
        setStatus('Consensus Reached: Asset Staked.');
        setStakeAmount('');
    };

    const handleUnstake = async () => {
        setStatus('Requesting Withdrawal from Hub...');
        await new Promise(r => setTimeout(r, 1500));
        setStakedBalance('0');
        setStatus('Withdrawal Finalized.');
    };

    const handleClaim = async () => {
        setStatus('Harvesting Radiant Yield...');
        await new Promise(r => setTimeout(r, 1500));
        setPendingRewards('0.00');
        setStatus('Yield Harvested to Radiant Wallet.');
    };

    return (
        <main className="min-h-screen bg-[#05070a] text-white flex flex-col items-center py-24 px-4 relative overflow-hidden">
            <BackgroundMesh />

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
                        <Link href="/leaderboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Leaderboard</Link>
                        <Link href="/stake" className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-blue-500 pb-1">Staking</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <WalletConnectButton />
                </div>
            </nav>

            <div className="max-w-6xl w-full z-10 pt-10">
                
                {/* HEADER & TOP PROTOCOL STATS */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10 pt-10"
                >
                    <div className="flex items-center space-x-6">
                        <div className="p-1 rounded-sm border border-blue-500 rotate-45 flex items-center justify-center">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 shadow-neon-blue"></div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter glow-text">GlowStake v3.0</h1>
                            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Institutional Yield Infrastructure</p>
                        </div>
                    </div>
                </motion.div>

                {/* STATS ROW */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                    {[
                        { label: 'Total Value Locked', val: '12.4M HBAR', detail: '+1.2% / 24h', color: 'text-blue-500' },
                        { label: 'Radiant Yield APY', val: '14.2%', detail: 'Estimated Rewards', color: 'text-purple-500' },
                        { label: 'Pool Maturity', val: '84.2%', detail: 'Epoch Progress', color: 'text-white/40' }
                    ].map((s, i) => (
                        <div key={i} className="glow-card p-10 rounded-[2.5rem] border border-white/5 shadow-radiant flex flex-col justify-between">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8">{s.label}</div>
                            <div>
                                <div className={`text-2xl font-black tracking-tighter ${s.color} mb-2`}>{s.val}</div>
                                <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{s.detail}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    
                    {/* LEFT: INTERACTION WIDGET */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-3 glow-card p-12 rounded-[4rem] relative overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Staking Command</h3>
                            <BackButton />
                        </div>

                        <div className="space-y-8">
                            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 focus-within:border-blue-500/40 transition-all">
                                <label className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-6 block ml-2">Deposit Liquidity</label>
                                <div className="flex justify-between items-center">
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                        className="bg-transparent text-5xl w-full outline-none font-black text-white placeholder-white/5 tracking-tighter"
                                    />
                                    <div className="flex items-center space-x-4">
                                        <button className="text-[10px] font-black text-blue-500 hover:text-blue-400">MAX</button>
                                        <div className="px-5 py-3 bg-white text-black font-black text-[11px] rounded-xl uppercase">HBAR</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <button onClick={handleStake} disabled={!stakeAmount || Number(stakeAmount) <= 0 || !isConnected} className="w-full py-7 bg-white text-black hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white font-black text-[12px] uppercase tracking-[0.5em] transition-all shadow-radiant disabled:opacity-5 rounded-[2rem]">Initialize Stake</button>
                                <button onClick={handleUnstake} disabled={Number(stakedBalance) <= 0 || !isConnected} className="w-full py-7 bg-white/5 text-white/30 hover:text-white font-black text-[12px] uppercase tracking-[0.5em] transition-all border border-white/5 rounded-[2rem]">Withdraw Asset</button>
                            </div>
                        </div>

                        {status && <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/10 text-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 rounded-3xl animate-glow-pulse-slow">{status}</div>}
                    </motion.div>

                    {/* RIGHT: HARVEST WIDGET */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 glow-card p-12 rounded-[4rem] flex flex-col justify-between"
                    >
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 mb-12">Radiant Yield</h3>
                            
                            <div className="space-y-10">
                                <div className="bg-purple-500/5 p-10 rounded-[3rem] border border-purple-500/10 text-center">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/40 mb-3">Accrued Rewards</div>
                                    <div className="text-5xl font-black glow-text tracking-tighter text-purple-400">{pendingRewards} <span className="text-xl">ℏ</span></div>
                                </div>

                                <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 text-center">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Your Principle</div>
                                    <div className="text-2xl font-black font-mono tracking-tighter text-white/80">{stakedBalance} Assets</div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleClaim} disabled={Number(pendingRewards) <= 0 || !isConnected} className="w-full mt-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-[12px] uppercase tracking-[0.6em] transition-all shadow-radiant-lg disabled:opacity-10 rounded-[2.5rem]">Harvest Consensys Yield</button>
                    </motion.div>
                </div>
            </div>

            <footer className="py-20 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.5em]">
                &copy; 2026 GlowSwap Protocol &bull; Radiant Build v3.0.0
            </footer>
        </main>
    );
}
