'use client';

import { useState } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { useHederaSigner } from '@/hooks/useHederaSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import { useSaucerSwapQuote } from '@/hooks/useSaucerSwapQuote';
import Link from 'next/link';
import { motion } from 'framer-motion';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
import { triggerSuccessConfetti } from '@/components/effects/ConfettiManager';

export default function SwapPage() {
    const { accountId, isConnected } = useHederaAccount();
    const { signer } = useHederaSigner();
    
    // Dynamic token mapping
    const [targetTokenId, setTargetTokenId] = useState<string>("0.0.1234567"); 
    const [hbarAmount, setHbarAmount] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(1.0); 
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');
    
    // Fetch live quote leveraging our custom V2 AMM hook
    const { expectedOutput, loading } = useSaucerSwapQuote(hbarAmount, slippage, "HBAR", targetTokenId);

    const executeSwap = async () => {
        if (!isConnected || !accountId || !signer) {
            setStatus("Please connect your wallet to proceed.");
            return;
        }

        setStatus("Requesting Radiant Approval...");

        try {
            const { ContractExecuteTransaction, ContractId, Hbar, HbarUnit } = await import('@hashgraph/sdk');
            const routerId = "0.0.3959082"; 
            
            const transaction = new ContractExecuteTransaction()
                .setContractId(ContractId.fromString(routerId))
                .setGas(1000000)
                .setPayableAmount(Hbar.from(Number(hbarAmount), HbarUnit.Hbar))
                .setFunction("swapExactETHForTokens", undefined);

            await signer.executeTransaction(transaction);
            
            triggerSuccessConfetti();

            try {
                const hcs = (await import('@/services/HCSService')).HCSService.getInstance();
                await hcs.publishEvent({
                    type: 'SWAP',
                    data: {
                        sender: accountId,
                        hbarAmount: hbarAmount,
                        targetToken: targetTokenId
                    }
                });
            } catch (hcsErr) {
                console.warn("HCS Broadcast failed:", hcsErr);
            }
            
            setStatus(`Successfully swaped ${hbarAmount} HBAR.`);
            setHbarAmount('');
            
        } catch (error: any) {
            setStatus(error.message || "Swap rejected.");
        }
    };

    return (
        <main className="min-h-screen bg-[#05070a] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white relative">
            
            <BackgroundMesh />

            {/* TOP NAVIGATION BAR */}
            <nav className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-black/40 backdrop-blur-md z-50 px-8 flex items-center justify-between">
                <div className="flex items-center space-x-12">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="p-1 rounded-sm border border-blue-500 group-hover:rotate-45 transition-transform duration-500 flex items-center justify-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500"></div>
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase glow-text">GlowSwap / HUB</span>
                    </Link>
                    
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/swap" className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-blue-500 pb-1">Swap</Link>
                        <Link href="/dashboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Launchpad</Link>
                        <Link href="/stake" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Staking</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <WalletConnectButton />
                </div>
            </nav>

            {/* CENTERED SWAP WIDGET */}
            <div className="flex-grow flex items-center justify-center pt-24 px-4 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-md w-full glow-card rounded-[2.5rem] p-10 shadow-radiant-lg relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                    
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-1 glow-text">Radiant Exchange</h2>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Optimized Hub Router</p>
                        </div>
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2.5 transition-all border outline-none rounded-xl ${showSettings ? 'border-blue-500 bg-blue-500/10 text-white shadow-neon-blue' : 'border-white/10 text-white/30 hover:text-white'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                        </button>
                    </div>

                    {showSettings && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-8 p-6 bg-white/5 border border-white/5 relative z-10 overflow-hidden rounded-[1.5rem]"
                        >
                            <label className="text-[10px] font-bold uppercase text-white/30 tracking-widest mb-4 block">Target Asset ID</label>
                            <input 
                                type="text"
                                value={targetTokenId}
                                onChange={(e) => setTargetTokenId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-xs font-mono mb-6 focus:border-blue-500 outline-none transition-all rounded-xl"
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-white/30 tracking-widest">Slippage Range</span>
                                <div className="flex space-x-2">
                                    {[0.5, 1, 3].map(val => (
                                        <button key={val} onClick={() => setSlippage(val)} className={`px-4 py-2 text-[9px] font-black border transition-all rounded-lg ${slippage === val ? 'border-blue-500 bg-blue-500/20 text-white shadow-neon-blue' : 'border-white/10 text-white/30'}`}>{val}%</button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* INPUT SECTION */}
                    <div className="space-y-2 relative z-10">
                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all focus-within:border-blue-500/50">
                            <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                <span>Source</span>
                                <span className="font-mono">Bal: 0.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input 
                                    type="number"
                                    placeholder="0"
                                    value={hbarAmount}
                                    onChange={(e) => setHbarAmount(e.target.value)}
                                    className="bg-transparent text-5xl font-black w-full outline-none placeholder:text-white/5 tracking-tighter"
                                />
                                <div className="flex items-center space-x-4">
                                    <button className="text-[10px] font-black text-blue-500 hover:text-blue-400">MAX</button>
                                    <div className="px-5 py-2 bg-white text-black font-black text-[11px] rounded-lg">HBAR</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center -my-6 relative z-20">
                            <div className="w-12 h-12 glow-card border border-white/10 flex items-center justify-center shadow-radiant hover:rotate-180 transition-transform duration-500 cursor-pointer rounded-2xl">
                                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                            <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                <span>Estimate</span>
                                {loading && <span className="text-[9px] text-blue-500 font-bold animate-pulse">Computing...</span>}
                            </div>
                            <div className="flex justify-between items-center">
                                <input 
                                    readOnly
                                    value={expectedOutput}
                                    placeholder="0"
                                    className="bg-transparent text-5xl font-black w-full outline-none placeholder:text-white/5 tracking-tighter"
                                />
                                <div className="px-5 py-2 border border-white/10 text-white/40 font-black text-[11px] rounded-lg">TOKEN</div>
                            </div>
                        </div>
                    </div>

                    {status && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-5 bg-blue-500/10 border border-blue-500/20 text-center text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] rounded-2xl glow-text"
                        >
                            {status}
                        </motion.div>
                    )}

                    <button 
                        onClick={executeSwap}
                        disabled={!hbarAmount || Number(hbarAmount) <= 0 || !isConnected}
                        className="w-full mt-10 py-6 bg-white text-black hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-radiant active:scale-[0.98] disabled:opacity-30 disabled:grayscale relative z-10 rounded-[1.5rem]"
                    >
                        {!isConnected ? 'Initialize Radiant Identity' : 'Verify & Execute Swap'}
                    </button>
                </motion.div>
            </div>

            <footer className="py-20 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.5em]">
                &copy; 2026 GlowSwap Protocol &bull; Radiant Build v2.5.0
            </footer>
        </main>
    );
}
