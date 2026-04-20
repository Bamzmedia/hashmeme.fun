'use client';

import { useState, useEffect } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { useHederaSigner } from '@/hooks/useHederaSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import BackButton from '@/components/BackButton';

const FORM_STORAGE_KEY = 'hashmeme_launch_form_v1';

export default function DashboardPage() {
  const { accountId, isConnected } = useHederaAccount();
  const { signer } = useHederaSigner();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: '8',
    initialSupply: '1000000',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [createdTokenId, setCreatedTokenId] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'ai'>('ai');

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

  const handleGenerateAI = async () => {
      if (!aiPrompt) return;
      setIsGenerating(true);
      setStatus("Generating your meme with AI magic...");
      try {
          const res = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: aiPrompt })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setImageUrl(data.imageUrl);
          setStatus("AI Meme Ready! Proceeding to launch.");
      } catch (e: any) {
          setStatus(`AI Error: ${e.message}`);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !signer) {
        setStatus("Please connect your wallet first!");
        return;
    }
    
    if (mode === 'upload' && !imageFile) {
        setStatus("Please select an image for your meme coin!");
        return;
    }

    if (mode === 'ai' && !imageUrl) {
        setStatus("Please generate an image with AI first!");
        return;
    }

    setLoading(true);
    setStatus("Uploading asset metadata to IPFS...");

    try {
        let finalCid = '';

        if (mode === 'upload' && imageFile) {
            const data = new FormData();
            data.append('file', imageFile);
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || "Image upload failed");
            finalCid = uploadData.cid;
        } else {
            // In a real scenario, we'd fetch the AI image and upload to Pinata
            // or use a direct URL. For now we use the AI generated link as the memo context.
            finalCid = imageUrl?.split('/').pop() || 'ai-meme';
        }

        setStatus(`Metadata pinned. Requesting wallet approval for Hedera launch...`);

        try {
            const { TokenCreateTransaction, AccountId, TokenSupplyType, TokenType } = await import('@hashgraph/sdk');
            
            const transaction = new TokenCreateTransaction()
                .setTokenName(formData.name)
                .setTokenSymbol(formData.symbol)
                .setDecimals(Number(formData.decimals))
                .setInitialSupply(Number(formData.initialSupply))
                .setTreasuryAccountId(AccountId.fromString(accountId!))
                .setTokenMemo(`ipfs://${finalCid}`)
                .setTokenType(TokenType.FungibleCommon)
                .setSupplyType(TokenSupplyType.Infinite);

            console.log("Pushing Token Creation to Wallet...");
            const response = await signer.executeTransaction(transaction);
            
            // Register with our backend tracking
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
            if (!launchRes.ok) throw new Error(launchData.error || "Token registration failed");

            setCreatedTokenId(launchData.tokenId);
            setStatus('');
            localStorage.removeItem(FORM_STORAGE_KEY);
            
        } catch (sdkError: any) {
            console.error("Signing Error:", sdkError);
            throw new Error(`Wallet signing failed: ${sdkError.message || 'The request was canceled.'}`);
        }

    } catch (error: any) {
        console.error(error);
        setStatus(error.message || "An unknown error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-10 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl w-full z-10 pt-10">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">Launch Pad</h1>
            <WalletConnectButton />
        </div>

        <div className="bg-white/5 border border-white/10 p-7 md:p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative">
            
            {!createdTokenId && <div className="flex justify-start mb-6 -mt-2"><BackButton /></div>}

            {createdTokenId ? (
                <div className="text-center py-8 animate-fade-in">
                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3">Meme Coin is Live!</h2>
                    <p className="text-sm text-gray-400 mb-8">Successfully deployed to Hedera Consensus Nodes.</p>
                    <div className="inline-block bg-black/40 px-6 py-3 rounded-2xl border border-white/10">
                        <p className="text-[10px] text-gray-500 mb-1 uppercase font-black">Token ID</p>
                        <p className="font-mono text-xl text-indigo-300 font-bold">{createdTokenId}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleCreateToken} className="space-y-6">
                    {/* MODE SELECTOR */}
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 mb-8">
                        <button 
                            type="button"
                            onClick={() => setMode('ai')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'ai' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            AI Generator
                        </button>
                        <button 
                            type="button"
                            onClick={() => setMode('upload')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'upload' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Direct Upload
                        </button>
                    </div>

                    {mode === 'ai' ? (
                        <div className="space-y-4 mb-8">
                             <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Art Prompt</label>
                             <div className="flex space-x-2">
                                <input 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g. A cybernetic doge on a rocket to Mars, neon lights..."
                                    className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                                />
                                <button 
                                    type="button"
                                    disabled={isGenerating || !aiPrompt}
                                    onClick={handleGenerateAI}
                                    className="bg-indigo-500 px-6 rounded-xl font-black text-xs uppercase hover:bg-indigo-400 text-white disabled:opacity-50"
                                >
                                    {isGenerating ? '...' : 'Gen'}
                                </button>
                             </div>
                             {imageUrl && (
                                 <div className="mt-4 p-2 bg-black/40 border border-white/10 rounded-2xl animate-fade-in flex items-center space-x-4">
                                     <img src={imageUrl} alt="AI Preview" className="w-16 h-16 rounded-xl bg-gray-900 object-cover" />
                                     <div>
                                         <p className="text-[10px] font-black text-emerald-400 uppercase">AI Art Generated</p>
                                         <p className="text-[10px] text-gray-500">Ready for network launch</p>
                                     </div>
                                 </div>
                             )}
                        </div>
                    ) : (
                        <div className="mb-8">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Token Image</label>
                            <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center hover:bg-white/[0.02] cursor-pointer relative min-h-[80px] flex items-center justify-center">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className={imageFile ? "text-emerald-400 text-xs font-bold" : "text-gray-500 text-xs"}>
                                    {imageFile ? `Ready: ${imageFile.name}` : "Click or drag image to upload"}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">Token Name</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. DogeMeme"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">Symbol</label>
                            <input 
                                required
                                value={formData.symbol}
                                onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                                placeholder="DOGE"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">Decimals</label>
                            <input 
                                required
                                type="number"
                                value={formData.decimals}
                                onChange={(e) => setFormData({...formData, decimals: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">Initial Supply</label>
                            <input 
                                required
                                type="number"
                                value={formData.initialSupply}
                                onChange={(e) => setFormData({...formData, initialSupply: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                            />
                        </div>
                    </div>

                    {status && (
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center text-[10px] text-indigo-300 font-bold uppercase tracking-widest animate-pulse">
                            {status}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading || !isConnected}
                        className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (!isConnected ? 'Connect Wallet' : 'Launch HTS Token')}
                    </button>
                </form>
            )}
        </div>
      </div>
    </main>
  );
}
