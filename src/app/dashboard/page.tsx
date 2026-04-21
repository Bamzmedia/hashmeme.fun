'use client';

import { useState, useEffect } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { useHederaSigner } from '@/hooks/useHederaSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import BackButton from '@/components/BackButton';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
import { triggerSuccessConfetti } from '@/components/effects/ConfettiManager';

const FORM_STORAGE_KEY = 'hashmeme_launch_v2.2_ai';

export default function DashboardPage() {
  const { accountId, isConnected } = useHederaAccount();
  const { signer } = useHederaSigner();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '8',
    initialSupply: '1000000000',
    burnRate: '1',
    treasuryRate: '1',
    isSupplyLocked: true,
  });
  
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [createdTokenId, setCreatedTokenId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

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
    try {
        // Using Pollinations for instant, free, high-quality dApp prototyping
        const seed = Math.floor(Math.random() * 1000000);
        const url = `https://gen.pollinations.ai/image/${encodeURIComponent(aiPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
        setPreviewUrl(url);
    } catch (e) {
        console.error("AI Gen Failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const bridgeToIPFS = async (url: string) => {
    setStatus("Bridging Intelligence to IPFS...");
    try {
        const response = await fetch('/api/bridge-ipfs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, name: formData.name })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.cid;
    } catch (e: any) {
        throw new Error(`IPFS Bridge Error: ${e.message}`);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !signer || !previewUrl) {
        setStatus("Connect wallet and generate an image first!");
        return;
    }
    
    setLoading(true);
    setStatus("Initiating Ledger Sequence...");

    try {
        // 1. BRIDGE TO IPFS
        const cid = await bridgeToIPFS(previewUrl);

        // 2. GENERATE HIP-412 METADATA
        setStatus(`Standardizing HTS Metadata (HIP-412)...`);
        const metadataJSON = {
            name: formData.name,
            symbol: formData.symbol,
            description: `Verified HTS Meme Asset: ${formData.name}`,
            image: `ipfs://${cid}`,
            type: "image/png",
            format: "HIP412@2.0.0",
            properties: {
                creator: accountId,
                origin: "HashMeme.fun"
            }
        };

        const metaFile = new File([JSON.stringify(metadataJSON)], "metadata.json", { type: "application/json" });
        const metaData = new FormData();
        metaData.append('file', metaFile);
        const metaRes = await fetch('/api/upload', { method: 'POST', body: metaData });
        const metaResData = await metaRes.json();
        if (!metaRes.ok) throw new Error("Metadata upload failed");
        const metaCid = metaResData.cid;

        // 3. MINT HTS TOKEN
        setStatus(`Signing Protocol Consensus...`);
        const { TokenCreateTransaction, AccountId, TokenSupplyType, TokenType, CustomFractionalFee, FeeAssessmentMethod } = await import('@hashgraph/sdk');
        
        const transaction = new TokenCreateTransaction()
            .setTokenName(formData.name)
            .setTokenSymbol(formData.symbol)
            .setDecimals(Number(formData.decimals))
            .setInitialSupply(Number(formData.initialSupply))
            .setTreasuryAccountId(AccountId.fromString(accountId!))
            .setTokenMemo(`ipfs://${metaCid}`) // POINT TO JSON
            .setTokenType(TokenType.FungibleCommon)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(Number(formData.initialSupply));

        const totalFee = Number(formData.burnRate) + Number(formData.treasuryRate);
        if (totalFee > 0) {
            const sinkFee = new CustomFractionalFee()
                .setNumerator(totalFee)
                .setDenominator(100)
                .setFeeCollectorAccountId(AccountId.fromString(accountId!))
                .setAssessmentMethod(FeeAssessmentMethod.Exclusive);
            transaction.setCustomFees([sinkFee]);
        }

        await signer.executeTransaction(transaction);
        
        // 3. LIST ON PROTOCOL
        const launchRes = await fetch('/api/launch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                imageCid: cid,
                creatorAccountId: accountId
            })
        });

        const launchData = await launchRes.json();
        if (!launchRes.ok) throw new Error(launchData.error);

        setCreatedTokenId(launchData.tokenId);
        setStatus('');
        localStorage.removeItem(FORM_STORAGE_KEY);
        triggerSuccessConfetti();

        // REAL-TIME BROADCAST (HCS)
        try {
            const hcs = (await import('@/services/HCSService')).HCSService.getInstance();
            await hcs.publishEvent({
                type: 'LAUNCH',
                data: {
                    name: formData.name,
                    symbol: formData.symbol,
                    tokenId: launchData.tokenId,
                    creator: accountId
                }
            });
        } catch (hcsErr) {
            console.warn("HCS Broadcast failed:", hcsErr);
        }
        
    } catch (error: any) {
        setStatus(error.message || "An error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex flex-col items-center py-24 px-4 relative overflow-hidden">
      <BackgroundMesh />

      <div className="max-w-5xl w-full z-10 pt-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-16"
        >
            <div className="flex items-center space-x-6">
                <div className="w-10 h-10 border-2 border-blue-500 rotate-45 flex items-center justify-center">
                    <div className="w-5 h-5 bg-blue-500"></div>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">AI Launchpad v2.2</h1>
            </div>
            <WalletConnectButton />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT: AI GENERATOR */}
            <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="frosted p-10 rounded-[3rem] shadow-neon-blue-lg space-y-8"
            >
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em]">Asset Generation Engine</h2>
                </div>

                <div className="aspect-square w-full glass rounded-3xl overflow-hidden relative group">
                    {previewUrl ? (
                        <img src={previewUrl} alt="AI Meme Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/10 space-y-4">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Identity Broadcast</span>
                        </div>
                    )}
                    {isGenerating && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.5em]">Synthesizing...</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4">
                    <label className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em]">Intelligence Prompt</label>
                    <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe your meme asset (e.g. 'Cyberpunk Pepe holding HBAR on Mars')..."
                        className="w-full bg-white/5 border border-white/5 px-6 py-5 text-xs text-white outline-none focus:border-blue-500 transition-all font-bold rounded-2xl min-h-[120px]"
                    />
                    <button 
                        onClick={generateAIImage}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className="w-full py-5 bg-blue-500/10 border border-blue-500/40 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all disabled:opacity-20"
                    >
                        Generate Intelligence
                    </button>
                </div>
            </motion.div>

            {/* RIGHT: DEPLOYMENT LOGIC */}
            <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="frosted p-10 rounded-[3rem] shadow-neon-blue-lg"
            >
                {createdTokenId ? (
                    <div className="h-full flex flex-col items-center justify-center py-10">
                        <div className="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-10 border border-blue-500/30 shadow-neon-blue">
                             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-center">Identity Live</h2>
                        <div className="mt-10 bg-black/40 px-8 py-5 rounded-3xl border border-white/10 text-center">
                            <span className="text-2xl font-mono text-blue-400 font-bold">{createdTokenId}</span>
                        </div>
                        <button onClick={() => setCreatedTokenId(null)} className="mt-10 text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white transition-colors">Deploy New Asset</button>
                    </div>
                ) : (
                    <form onSubmit={handleCreateToken} className="space-y-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Protocol Parameters</h2>
                            <BackButton />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label>Asset Name</label>
                                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-5 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold rounded-xl" placeholder="E.G. NEON HARAMBE" />
                            </div>
                            <div className="space-y-3">
                                <label>Ticker Symbol</label>
                                <input required value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-5 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold rounded-xl" placeholder="NEON" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label>Initial Supply</label>
                                <input required type="number" value={formData.initialSupply} onChange={(e) => setFormData({...formData, initialSupply: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-5 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold rounded-xl" placeholder="100,000,000" />
                            </div>
                            <div className="space-y-3">
                                <label>Supply Key</label>
                                <div className="flex items-center justify-between bg-white/5 border border-white/5 px-6 py-5 rounded-xl">
                                    <span className={formData.isSupplyLocked ? 'text-blue-500' : 'text-white/10'}>IMMU</span>
                                    <input type="checkbox" checked={formData.isSupplyLocked} onChange={(e) => setFormData({...formData, isSupplyLocked: e.target.checked})} className="accent-blue-500 w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-blue-500 hover:text-white transition-colors py-2 border-b-2 border-blue-500/20 w-full text-left">
                            {showAdvanced ? '- Contract Logic: Safe' : '+ Adjust Protocol Fees'}
                        </button>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-8 pt-4 overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-blue-400">Burn Rate (%)</label>
                                            <input type="number" value={formData.burnRate} onChange={(e) => setFormData({...formData, burnRate: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white text-xs outline-none focus:border-blue-500 transition-all" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-blue-400">Treasury Fee (%)</label>
                                            <input type="number" value={formData.treasuryRate} onChange={(e) => setFormData({...formData, treasuryRate: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white text-xs outline-none focus:border-blue-500 transition-all" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {status && <div className="p-5 bg-blue-500/10 border border-blue-500/20 text-center text-blue-400 animate-fade-in font-bold uppercase tracking-[0.2em] rounded-xl">{status}</div>}

                        <button 
                            type="submit" 
                            disabled={loading || !isConnected || !previewUrl} 
                            className="w-full py-6 bg-white text-black hover:bg-blue-500 hover:text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-neon-blue active:scale-95 disabled:opacity-10 disabled:grayscale"
                        >
                            {loading ? 'Consensus In Progress...' : 'Verify & Launch Asset'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
      </div>
    </main>
  );
}
