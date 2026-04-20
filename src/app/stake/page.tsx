'use client';

import { useState, useEffect } from 'react';
import { useHashConnect } from '@/context/HashConnectProvider';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function StakePage() {
    const { accountId, state } = useHashConnect();
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
        if (!accountId) return;
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
        <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-12 md:py-20 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-xl w-full z-10">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-12 gap-4">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">Stake to Earn</h1>
                    <WalletConnectButton />
                </div>

                <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-gray-400 text-sm mb-1">Total Staked MEME</h3>
                            <div className="text-2xl md:text-3xl font-bold font-mono text-white">{Number(stakedBalance).toLocaleString()}</div>
                        </div>
                        <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 shadow-inner">
                            <h3 className="text-emerald-400 text-sm mb-1">Pending HBAR Rewards</h3>
                            <div className="text-2xl md:text-3xl font-bold font-mono text-emerald-300">{pendingRewards} <span className="text-sm">ℏ</span></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5 focus-within:border-emerald-500/40 transition-colors">
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-gray-400">Stake Amount</label>
                            </div>
                            <div className="flex justify-between items-center">
                                <input 
                                    type="number"
                                    placeholder="0"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                    className="bg-transparent text-3xl md:text-4xl w-full outline-none font-bold text-white placeholder-gray-800"
                                />
                                <button className="bg-white/10 text-xs px-2 py-1 rounded text-gray-300 hover:bg-white/20 ml-2">MAX</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <button 
                                onClick={handleStake}
                                disabled={!stakeAmount || Number(stakeAmount) <= 0 || state !== 'Connected'}
                                className="w-full py-4 rounded-xl font-bold text-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Deposit
                            </button>
                            <button 
                                onClick={handleUnstake}
                                disabled={Number(stakedBalance) <= 0 || state !== 'Connected'}
                                className="w-full py-4 rounded-xl font-bold text-lg bg-gray-800 hover:bg-gray-700 transition-colors text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Withdraw
                            </button>
                        </div>

                        <button 
                            onClick={handleClaim}
                            disabled={Number(pendingRewards) <= 0 || state !== 'Connected'}
                            className="w-full mt-4 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all text-white shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50 disabled:shadow-none"
                        >
                            Claim HBAR Rewards
                        </button>

                        {status && (
                            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-sm text-emerald-300">
                                {status}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
