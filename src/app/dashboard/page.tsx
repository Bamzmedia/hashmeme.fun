'use client';

import { useState, useEffect } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { useHederaSigner } from '@/hooks/useHederaSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import BackButton from '@/components/BackButton';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
import { triggerSuccessConfetti } from '@/components/effects/ConfettiManager';

const FORM_STORAGE_KEY = 'hashmeme_launch_form_v2.1';

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
    vestingMonths: '12',
    treasuryAllocation: '10'
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [createdTokenId, setCreatedTokenId] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'ai'>('ai');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
        try {
            setFormData(JSON.parse(savedData));
        } catch (e) {
            console.warn("Failed to parse saved form data", e);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !signer) {
        setStatus("Please connect your wallet first!");
        return;
    }
    
    setLoading(true);
    setStatus("Initiating Ledger Deployment...");

    try {
        let finalCid = imageUrl || 'ai-meme-fallback';

        if (mode === 'upload' && imageFile) {
            const data = new FormData();
            data.append('file', imageFile);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: data });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error);
            finalCid = uploadData.cid;
        }

        setStatus(`Verifying Immutable Logic...`);

        try {
            const { TokenCreateTransaction, AccountId, TokenSupplyType, TokenType, CustomFractionalFee, FeeAssessmentMethod } = await import('@hashgraph/sdk');
            
            const transaction = new TokenCreateTransaction()
                .setTokenName(formData.name)
                .setTokenSymbol(formData.symbol)
                .setDecimals(Number(formData.decimals))
                .setInitialSupply(Number(formData.initialSupply))
                .setTreasuryAccountId(AccountId.fromString(accountId!))
                .setTokenMemo(`ipfs://${finalCid}`)
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
            
            const launchRes = await fetch('/api/launch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    imageCid: finalCid,
                    creatorAccountId: accountId
                })
            });

            const launchData = await launchRes.json();
            if (!launchRes.ok) throw new Error(launchData.error);

            setCreatedTokenId(launchData.tokenId);
            setStatus('');
            localStorage.removeItem(FORM_STORAGE_KEY);
            
            // CELEBRATION
            triggerSuccessConfetti();
            
        } catch (sdkError: any) {
            throw new Error(`Execution failed: ${sdkError.message}`);
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

      <div className="max-w-2xl w-full z-10 pt-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-12"
        >
            <div className="flex items-center space-x-6">
                <div className="w-10 h-10 border-2 border-blue-500 rotate-45 flex items-center justify-center">
                    <div className="w-5 h-5 bg-blue-500"></div>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Protocol Launchpad</h1>
            </div>
            <WalletConnectButton />
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="frosted p-8 md:p-12 rounded-[3rem] shadow-neon-blue-lg relative overflow-hidden"
        >
            {!createdTokenId && <div className="flex justify-start mb-8 -mt-2"><BackButton /></div>}

            {createdTokenId ? (
                <div className="text-center py-12 relative z-10">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-10 border border-blue-500/30 shadow-neon-blue"
                    >
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </motion.div>
                    <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Protocol Successfully Deployed</h2>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-10">Verification code established on mirror node consensus</p>
                    <div className="inline-block bg-black/40 px-8 py-5 rounded-3xl border border-white/10 shadow-xl">
                        <p className="font-mono text-2xl text-blue-400 font-bold tracking-tighter">{createdTokenId}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleCreateToken} className="space-y-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 relative z-10">
                    
                    {/* ASSET SELECTOR */}
                    <div className="flex bg-black/40 p-2 rounded-2xl border border-white/5 mb-10">
                        <button type="button" onClick={() => setMode('ai')} className={`flex-1 py-4 text-[9px] transition-all border outline-none ${mode === 'ai' ? 'border-blue-500 bg-blue-500/10 text-white shadow-neon-blue' : 'border-transparent hover:text-white'}`}>Intelligence Engine</button>
                        <button type="button" onClick={() => setMode('upload')} className={`flex-1 py-4 text-[9px] transition-all border outline-none ${mode === 'upload' ? 'border-blue-500 bg-blue-500/10 text-white shadow-neon-blue' : 'border-transparent hover:text-white'}`}>Manual Archive</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label>Designation Name</label>
                            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-5 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold" placeholder="E.G. HASH TITAN" />
                        </div>
                        <div className="space-y-3">
                            <label>Ledger Symbol</label>
                            <input required value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-5 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold" placeholder="HTN" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label>Initial Saturation</label>
                            <input required type="number" value={formData.initialSupply} onChange={(e) => setFormData({...formData, initialSupply: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-5 text-white text-xs outline-none focus:border-blue-500 transition-all font-bold" placeholder="100,000,000" />
                        </div>
                        <div className="space-y-3">
                            <label>Immutability Status</label>
                            <div className="flex items-center justify-between bg-white/5 border border-white/5 px-6 py-5">
                                <span className={formData.isSupplyLocked ? 'text-blue-500' : 'text-white/20'}>Verified Immutability</span>
                                <input type="checkbox" checked={formData.isSupplyLocked} onChange={(e) => setFormData({...formData, isSupplyLocked: e.target.checked})} className="accent-blue-500 w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* ADVANCED REVENUE SINKS */}
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-blue-500 hover:text-white transition-colors py-2 border-b-2 border-blue-500/20 w-full text-left">
                        {showAdvanced ? '- Collapse Protocol Logic' : '+ Modify Verified Revenue Sinks & Vesting'}
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
                                        <label className="text-blue-400">Burn Coefficient (%)</label>
                                        <input type="number" value={formData.burnRate} onChange={(e) => setFormData({...formData, burnRate: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white text-xs outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-blue-400">Nodes Fee (%)</label>
                                        <input type="number" value={formData.treasuryRate} onChange={(e) => setFormData({...formData, treasuryRate: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white text-xs outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-blue-400">Execution Vesting (Mo)</label>
                                        <input type="number" value={formData.vestingMonths} onChange={(e) => setFormData({...formData, vestingMonths: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white text-xs outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-blue-400">Ledger Reservation (%)</label>
                                        <input type="number" value={formData.treasuryAllocation} onChange={(e) => setFormData({...formData, treasuryAllocation: e.target.value})} className="w-full bg-white/5 border border-white/5 px-6 py-4 text-white text-xs outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {status && <div className="p-5 bg-blue-500/10 border border-blue-500/20 text-center text-blue-400 animate-fade-in font-bold uppercase tracking-[0.2em]">{status}</div>}

                    <button type="submit" disabled={loading || !isConnected} className="w-full py-6 bg-white text-black hover:bg-blue-500 hover:text-white font-black text-[10px] uppercase tracking-[0.5em] transition-all shadow-neon-blue active:scale-95 disabled:grayscale disabled:opacity-20">
                        {loading ? 'Executing Consensus Logic...' : 'Deploy Protocol Asset'}
                    </button>
                </form>
            )}
        </motion.div>
      </div>
    </main>
  );
}
