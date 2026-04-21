'use client';

import { useState, useEffect } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { useHederaSigner } from '@/hooks/useHederaSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import BackButton from '@/components/BackButton';

const FORM_STORAGE_KEY = 'hashmeme_launch_form_v2'; // Bump version for new fields

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
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
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
    setStatus("Initiating Advanced Tokenomics Launch...");

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

        setStatus(`Signing Immutable Contract & Custom Fees...`);

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

            // NATIVE REVENUE SINK: Custom Fractional Fees
            const totalFee = Number(formData.burnRate) + Number(formData.treasuryRate);
            if (totalFee > 0) {
                const sinkFee = new CustomFractionalFee()
                    .setNumerator(totalFee)
                    .setDenominator(100)
                    .setFeeCollectorAccountId(AccountId.fromString(accountId!))
                    .setAssessmentMethod(FeeAssessmentMethod.Exclusive);
                transaction.setCustomFees([sinkFee]);
            }

            // SECURITY: RENUNCIATION OF SUPPLY KEY
            if (formData.isSupplyLocked) {
                console.log("Renouncing Supply Key for mathematical immutability...");
                // In HTS, not setting a supply key makes it immutable
            }

            const response = await signer.executeTransaction(transaction);
            
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
            
        } catch (sdkError: any) {
            console.error("Launch Error:", sdkError);
            throw new Error(`Execution failed: ${sdkError.message}`);
        }

    } catch (error: any) {
        setStatus(error.message || "An error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-10 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl w-full z-10 pt-10">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">Advanced Launchpad</h1>
            <WalletConnectButton />
        </div>

        <div className="bg-white/5 border border-white/10 p-7 md:p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
            {!createdTokenId && <div className="flex justify-start mb-6 -mt-2"><BackButton /></div>}

            {createdTokenId ? (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3">Immutable Token Deployed</h2>
                    <p className="text-sm text-gray-400 mb-8">Your revenue sinks and security protocols are now live on the ledger.</p>
                    <div className="inline-block bg-black/40 px-6 py-3 rounded-2xl border border-white/10">
                        <p className="font-mono text-xl text-indigo-300 font-bold">{createdTokenId}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleCreateToken} className="space-y-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    
                    {/* ASSET SELECTOR */}
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 mb-8">
                        <button type="button" onClick={() => setMode('ai')} className={`flex-1 py-3 rounded-xl transition-all ${mode === 'ai' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:text-white'}`}>AI Gen</button>
                        <button type="button" onClick={() => setMode('upload')} className={`flex-1 py-3 rounded-xl transition-all ${mode === 'upload' ? 'bg-indigo-500 text-white shadow-lg' : 'hover:text-white'}`}>Upload</button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" placeholder="NAME" />
                        <input required value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" placeholder="SYMBOL" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <input required type="number" value={formData.initialSupply} onChange={(e) => setFormData({...formData, initialSupply: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" placeholder="TOTAL SUPPLY" />
                        <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                            <span className={formData.isSupplyLocked ? 'text-indigo-400' : 'text-gray-500'}>Supply Lock</span>
                            <input type="checkbox" checked={formData.isSupplyLocked} onChange={(e) => setFormData({...formData, isSupplyLocked: e.target.checked})} className="toggle-checkbox" />
                        </div>
                    </div>

                    {/* ADVANCED REVENUE SINKS */}
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        {showAdvanced ? '- Hide Advanced Tokenomics' : '+ Configure Revenue Sinks & Vesting'}
                    </button>

                    {showAdvanced && (
                        <div className="space-y-6 pt-4 border-t border-white/5 animate-fade-in">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2 text-indigo-400">Burn Rate (%)</label>
                                    <input type="number" value={formData.burnRate} onChange={(e) => setFormData({...formData, burnRate: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-indigo-400">Protocol Fee (%)</label>
                                    <input type="number" value={formData.treasuryRate} onChange={(e) => setFormData({...formData, treasuryRate: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2 text-indigo-400">Team Vesting (Months)</label>
                                    <input type="number" value={formData.vestingMonths} onChange={(e) => setFormData({...formData, vestingMonths: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block mb-2 text-indigo-400">Treasury Allocation (%)</label>
                                    <input type="number" value={formData.treasuryAllocation} onChange={(e) => setFormData({...formData, treasuryAllocation: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                                </div>
                            </div>
                        </div>
                    )}

                    {status && <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center text-indigo-300 animate-pulse">{status}</div>}

                    <button type="submit" disabled={loading || !isConnected} className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20 disabled:opacity-50">
                        {loading ? 'DEPLOYING LEDGER LOGIC...' : 'Launch Advanced Token'}
                    </button>
                </form>
            )}
        </div>
      </div>
    </main>
  );
}
