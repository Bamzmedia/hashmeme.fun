'use client';

import { useState, useEffect } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import WalletConnectButton from '@/components/WalletConnectButton';
import BackButton from '@/components/BackButton';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
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
        setStatus('Approving token transfer to Staking pool...');
        await new Promise(r => setTimeout(r, 1500));
        setStakedBalance(prev => (Number(prev) + Number(stakeAmount)).toString());
        setStatus('Successfully staked MEME tokens!');
        setStakeAmount('');
    };

    const handleUnstake = async () => {
        setStatus('Withdrawing from pool...');
        await new Promise(r => setTimeout(r, 1500));
        setStakedBalance('0');
        setStatus('Successfully unstaked tokens.');
    };

    const handleClaim = async () => {
        setStatus('Claiming HBAR rewards...');
        await new Promise(r => setTimeout(r, 1500));
        setPendingRewards('0.00');
        setStatus('HBAR transferred to your wallet!');
    };

    return (
        <main className="min-h-screen bg-[#05070a] text-white flex flex-col items-center py-24 px-4 relative overflow-hidden">
            <BackgroundMesh />

            <div className="max-w-2xl w-full z-10 pt-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8 px-4"
                >
                    <BackButton />
                    <WalletConnectButton />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-12"
                >
                    <div className="flex items-center space-x-6">
                        <div className="w-10 h-10 border-2 border-blue-500 rotate-45 flex items-center justify-center">
                            <div className="w-5 h-5 bg-blue-500"></div>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Stake Protocol</h1>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="frosted p-8 md:p-12 rounded-[3.5rem] shadow-neon-blue-lg relative overflow-hidden"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                            <h3 className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">Total Staked HTS</h3>
                            <div className="text-3xl font-black font-mono text-white tracking-tighter">{Number(stakedBalance).toLocaleString()}</div>
                        </div>
                        <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20 shadow-inner">
                            <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pending HBAR Rewards</h3>
                            <div className="text-3xl font-black font-mono text-blue-300 tracking-tighter">{pendingRewards} <span className="text-sm">ℏ</span></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 focus-within:border-blue-500/40 transition-colors">
                            <div className="flex justify-between mb-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Deposit Amount</label>
                            </div>
                            <div className="flex justify-between items-center">
                                <input 
                                    type="number"
                                    placeholder="0"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                    className="bg-transparent text-4xl w-full outline-none font-black text-white placeholder-white/10 tracking-tighter"
                                />
                                <button className="bg-white/5 text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl text-white/40 hover:bg-white/10 hover:text-white ml-2 transition-all">MAX</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <button 
                                onClick={handleStake}
                                disabled={!stakeAmount || Number(stakeAmount) <= 0 || !isConnected}
                                className="w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] bg-white text-black hover:bg-blue-500 hover:text-white transition-all shadow-neon-blue disabled:opacity-20 disabled:grayscale"
                            >
                                Stake
                            </button>
                            <button 
                                onClick={handleUnstake}
                                disabled={Number(stakedBalance) <= 0 || !isConnected}
                                className="w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white transition-all disabled:opacity-10"
                            >
                                Withdraw
                            </button>
                        </div>

                        <button 
                            onClick={handleClaim}
                            disabled={Number(pendingRewards) <= 0 || !isConnected}
                            className="w-full mt-4 py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.5em] bg-blue-500 text-white hover:bg-blue-400 transition-all shadow-neon-blue disabled:opacity-20 disabled:shadow-none"
                        >
                            Claim Consensus Rewards
                        </button>

                        {status && (
                            <div className="mt-8 p-5 bg-blue-500/10 border border-blue-500/20 text-center text-[10px] font-black uppercase tracking-widest text-blue-400 animate-fade-in">
                                {status}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
