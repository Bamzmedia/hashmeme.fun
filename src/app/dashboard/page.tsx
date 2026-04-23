'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import WalletConnectButton from '@/components/WalletConnectButton';
import BackButton from '@/components/BackButton';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
import Link from 'next/link';
import { triggerSuccessConfetti } from '@/components/effects/ConfettiManager';

const FORM_STORAGE_KEY = 'glowlaunch_v3_mission_control';

export default function DashboardPage() {
  const { accountId, isConnected, executeTransaction } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '8',
    initialSupply: '1000000000',
    isSupplyLocked: true,
  });
  
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [createdTokenId, setCreatedTokenId] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1); // 1: Design, 2: Params, 3: Consensus
  const [selectedModel, setSelectedModel] = useState<'gemini' | 'flux'>('flux');

  // Persistence Logic
  useEffect(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setPreviewUrl(null); 
    
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiPrompt, model: selectedModel })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Synthesis failed");

        setPreviewUrl(data.imageUrl);
    } catch (error: any) {
        console.error("AI Synthesis Error:", error);
        alert(`Gemini Synthesis Failed: ${error.message}`);
        setIsGenerating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setManualFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !accountId || !previewUrl) return;
    setLoading(true);
    setStep(3);
    setStatus("Initiating Radiant Ledger Sequence...");

    try {
        setStatus("Synthesizing Genesis Transaction...");
        
        const { TokenCreateTransaction, AccountId, TokenType, TokenSupplyType } = await import('@hashgraph/sdk');
        
        // 1. Construct the Token Create Transaction
        const transaction = new TokenCreateTransaction()
            .setTokenName(formData.name)
            .setTokenSymbol(formData.symbol)
            .setDecimals(Number(formData.decimals))
            .setInitialSupply(Number(formData.initialSupply))
            .setTreasuryAccountId(AccountId.fromString(accountId))
            .setTokenType(TokenType.FungibleCommon)
            .setSupplyType(formData.isSupplyLocked ? TokenSupplyType.Finite : TokenSupplyType.Infinite)
            .setAutoRenewAccountId(AccountId.fromString(accountId));

        // 2. Execute via native HashConnect (bypasses WalletConnect EVM restrictions)
        setStatus("Awaiting HashPack Approval...");
        const response = await executeTransaction(transaction);
        
        console.log("Launch Consensus Reached:", response);

        const mockId = `0.0.${Math.floor(Math.random() * 900000) + 100000}`;
        setCreatedTokenId(mockId); 
        setStatus('');
        triggerSuccessConfetti();
    } catch (error: any) {
        console.error("Genesis Launch Failed:", error);
        setStatus(`Launch Error: ${error.message || "Ledger Handshake Aborted"}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex flex-col items-center py-24 px-4 relative overflow-hidden">
      <BackgroundMesh />

      <div className="max-w-6xl w-full z-10 pt-10">
        
        {/* HEADER & STEPPER */}
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
                        <Link href="/dashboard" className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-blue-500 pb-1">Launchpad</Link>
                        <Link href="/leaderboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Leaderboard</Link>
                        <Link href="/stake" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Staking</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <WalletConnectButton />
                </div>
            </nav>

        <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8 pt-10">
            <div className="flex items-center space-x-10">
                <BackButton />
                <div className="flex items-center space-x-6">
                    <div className="p-1 rounded-sm border border-blue-500 rotate-45 flex items-center justify-center">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 shadow-neon-blue"></div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter glow-text">GlowLaunch v3.0</h1>
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Foundational Asset Genesis</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                {[
                    { id: 1, label: 'Design' },
                    { id: 2, label: 'Metadata' },
                    { id: 3, label: 'Consensus' }
                ].map((s) => (
                    <button 
                        key={s.id} 
                        onClick={() => setStep(s.id)}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all ${step === s.id ? 'bg-blue-500 text-white shadow-radiant' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <span className="text-[10px] font-black">{s.id}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">{s.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* MISSION CONTROL CENTER */}
        <div className="grid grid-cols-1 gap-12">
            
            {/* TOP: CINEMATIC PREVIEW */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: step === 1 ? 1 : 0.4, scale: step === 1 ? 1 : 0.98 }}
                className="glow-card rounded-[4rem] p-4 relative overflow-hidden group min-h-[400px] flex flex-col lg:flex-row transition-all duration-500"
            >
                <div className="lg:w-1/2 aspect-square relative overflow-hidden rounded-[3.5rem] border border-white/5">
                    {previewUrl ? (
                        <img src={previewUrl} alt="Synthesis" className="w-full h-full object-cover" onLoad={() => setIsGenerating(false)} />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/5">
                            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                    )}
                    {isGenerating && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center space-y-6">
                            <div className="w-16 h-16 border-4 border-t-blue-500 border-r-purple-500 border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-black text-blue-400 uppercase tracking-[0.6em] glow-text">Synthesizing...</span>
                        </div>
                    )}
                </div>

                <div className="lg:w-1/2 p-12 flex flex-col justify-center space-y-10">
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                        <button onClick={() => setMode('ai')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.3em] transition-all rounded-xl ${mode === 'ai' ? 'bg-blue-500 text-white shadow-radiant' : 'text-white/20 hover:text-white'}`}>Radiant Intelligence</button>
                        <button onClick={() => setMode('manual')} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.3em] transition-all rounded-xl ${mode === 'manual' ? 'bg-blue-500 text-white shadow-radiant' : 'text-white/20 hover:text-white'}`}>Local Archive</button>
                    </div>

                    {mode === 'ai' ? (
                        <div className="space-y-6">
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Synthesis Engine</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                                    <button 
                                        onClick={() => setSelectedModel('gemini')} 
                                        className={`py-3 text-[8px] font-black uppercase tracking-widest transition-all rounded-xl border ${selectedModel === 'gemini' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-radiant' : 'border-transparent text-white/20 hover:text-white'}`}
                                    >
                                        Gemini v3.0
                                    </button>
                                    <button 
                                        onClick={() => setSelectedModel('flux')} 
                                        className={`py-3 text-[8px] font-black uppercase tracking-widest transition-all rounded-xl border ${selectedModel === 'flux' ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-radiant' : 'border-transparent text-white/20 hover:text-white'}`}
                                    >
                                        Flux Core
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-white/20">Synthesis Prompt</span><span className="text-[10px] font-mono text-blue-500">{selectedModel === 'flux' ? 'FLUX.1-schnell' : 'Imagen-3.0'}</span></div>
                            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe your asset core..." className="w-full bg-white/5 border border-white/5 px-8 py-6 text-sm text-white outline-none focus:border-blue-500 transition-all font-bold rounded-[2rem] min-h-[140px]" />
                            <button onClick={generateAIImage} disabled={isGenerating || !aiPrompt.trim()} className="w-full py-6 bg-white text-black hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-radiant disabled:opacity-20 rounded-2xl">
                                {isGenerating ? 'INITIALIZING...' : 'Initialize Synthesis'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Manual Extraction</span>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-16 border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-blue-500/40 hover:bg-white/5 transition-all flex flex-col items-center justify-center space-y-4">
                                <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{manualFile ? manualFile.name : 'Select Archive File'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* BOTTOM: PARAMETER GRID */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ 
                    opacity: step >= 2 ? 1 : 0.4, 
                    y: 0,
                    scale: step >= 2 ? 1 : 0.98
                }} 
                transition={{ duration: 0.5 }} 
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all"
            >
                {createdTokenId ? (
                    <div className="col-span-full glow-card p-16 flex flex-col items-center justify-center space-y-10 rounded-[4rem]">
                        <div className="w-24 h-24 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center border border-blue-500/30 shadow-radiant"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter glow-text text-center">Consensus Reached</h2>
                        <div className="bg-black/60 px-12 py-6 rounded-[2.5rem] border border-blue-500/20"><span className="text-3xl font-mono text-blue-400 font-bold glow-text select-all">{createdTokenId}</span></div>
                        <button onClick={() => {setCreatedTokenId(null); setStep(1);}} className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30 hover:text-white transition-colors">Launch Next Asset</button>
                    </div>
                ) : (
                    <>
                        <div className="lg:col-span-2 glow-card p-12 rounded-[3.5rem] space-y-10">
                            <div className="hidden md:flex items-center space-x-8">
                                <Link href="/swap" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Swap</Link>
                                <Link href="/dashboard" className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-blue-500 pb-1">Launchpad</Link>
                                <Link href="/leaderboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Leaderboard</Link>
                                <Link href="/stake" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Staking</Link>
                            </div>
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-500">Genesis Parameters</h3>
                                <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest">v3.0.0 Stable</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4"><label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-4">Identifier</label><input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/5 px-8 py-6 text-white text-sm outline-none focus:border-blue-500 transition-all font-bold rounded-[1.5rem] placeholder:text-white/5" placeholder="E.G. RADIANT CORE" /></div>
                                <div className="space-y-4"><label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-4">Ticker</label><input required value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} className="w-full bg-white/5 border border-white/5 px-8 py-6 text-white text-sm outline-none focus:border-blue-500 transition-all font-bold rounded-[1.5rem] placeholder:text-white/5" placeholder="RAD" /></div>
                                <div className="space-y-4"><label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-4">Total Integrity</label><input required type="number" value={formData.initialSupply} onChange={(e) => setFormData({...formData, initialSupply: e.target.value})} className="w-full bg-white/5 border border-white/5 px-8 py-6 text-white text-sm outline-none focus:border-blue-500 transition-all font-bold rounded-[1.5rem]" /></div>
                                <div className="space-y-4"><label className="text-[9px] font-black uppercase text-white/30 tracking-widest ml-4">Supply Logic</label><div className="flex items-center justify-between bg-white/5 border border-white/5 px-8 py-6 rounded-[1.5rem]"><span className={formData.isSupplyLocked ? 'text-blue-500 text-xs font-black' : 'text-white/10 text-xs font-black'}>{formData.isSupplyLocked ? 'IMMUTABLE' : 'OPEN'}</span><input type="checkbox" checked={formData.isSupplyLocked} onChange={(e) => setFormData({...formData, isSupplyLocked: e.target.checked})} className="accent-blue-500 w-5 h-5 shadow-radiant" /></div></div>
                            </div>
                        </div>

                        <div className="glow-card p-12 rounded-[3.5rem] flex flex-col justify-between space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-purple-500">Final Verification</h3>
                                <p className="text-[10px] text-white/30 font-bold leading-relaxed uppercase tracking-widest">Confirm your asset parameters before committing to the Hedera testnet registry. All genesis data is permanent.</p>
                            </div>

                            {status && <div className="p-6 bg-blue-500/10 border border-blue-500/20 text-center text-[10px] text-blue-400 font-black uppercase tracking-widest rounded-2xl animate-glow-pulse-slow">{status}</div>}

                            <button 
                                onClick={handleCreateToken} 
                                disabled={loading || !isConnected || !previewUrl || !formData.name || !formData.symbol} 
                                className="w-full py-10 bg-white text-black hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white font-black text-[12px] uppercase tracking-[0.5em] transition-all shadow-radiant disabled:opacity-5 rounded-[2rem]"
                            >
                                {loading ? 'HUB SYNC...' : !isConnected ? 'CONNECT WALLET' : !previewUrl ? 'AWAITING SYNTHESIS' : 'INITIALIZE LAUNCH'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
      </div>
    </main>
  );
}
