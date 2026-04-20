'use client';

import { useState } from 'react';
import { useHashConnect } from '@/context/HashConnectProvider';
import WalletConnectButton from '@/components/WalletConnectButton';
import { useSaucerSwapQuote } from '@/hooks/useSaucerSwapQuote';
import { buildSaucerSwapTx } from '@/utils/swapTransaction';

export default function SwapPage() {
    const { accountId, state, hashConnect, pairingData } = useHashConnect();
    const [hbarAmount, setHbarAmount] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(5.0); // 5% default for volatile meme coins
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');

    // Mock token for demo: In reality, users could select a token from a curated list of launched tokens
    const DEMO_TOKEN_ID = "0.0.1234567";
    
    // Fetch live quote leveraging our custom V2 AMM hook
    const { expectedOutput, minimumOutput, loading } = useSaucerSwapQuote(hbarAmount, slippage, "HBAR", DEMO_TOKEN_ID);

    const executeSwap = async () => {
        if (!hashConnect || !(pairingData as any)?.topic) {
            setStatus("Please connect your HashPack wallet to proceed.");
            return;
        }

        setStatus("Please approve the SaucerSwap Router transaction in HashPack...");

        try {
            // Build the execution payload
            const routerId = "0.0.3959082"; // Example Testnet V2 Router
            const unsignedTx = await buildSaucerSwapTx(
                routerId,
                "0.0.X_WHBAR",
                DEMO_TOKEN_ID,
                3000, 
                Number(hbarAmount),
                Number(minimumOutput),
                accountId!
            );

            // In production:
            // const provider = hashConnect.getProvider("testnet", pairingData.topic, accountId!);
            // const signer = hashConnect.getSigner(provider);
            // await unsignedTx.executeWithSigner(signer);
            
            // Simulation environment resolution:
            await new Promise(r => setTimeout(r, 2000));
            setStatus(`Swap Successful! Your wallet received exactly ${expectedOutput} Memes! (Development Mode)`);
            setHbarAmount('');
            
        } catch (error: any) {
            setStatus(error.message || "User rejected the signing request.");
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-20 px-4 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-md w-full z-10 flex flex-col space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-extrabold tracking-tight">DEX Swap</h1>
                    <WalletConnectButton />
                </div>

                {/* Main Card */}
                <div className="bg-black/60 border border-white/10 p-6 rounded-[2rem] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                    
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm text-gray-400 font-medium tracking-wide">Swap instantly on SaucerSwap V2</span>
                        <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors group">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                    </div>

                    {showSettings && (
                        <div className="mb-6 p-5 bg-white/5 rounded-[1.5rem] border border-white/5 animate-fade-in shadow-inner">
                            <label className="text-sm text-gray-400 mb-3 block">Slippage Tolerance</label>
                            <div className="flex space-x-2">
                                {[0.5, 1, 5].map(val => (
                                    <button 
                                        key={val}
                                        onClick={() => setSlippage(val)}
                                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-colors ${slippage === val ? 'bg-indigo-500 text-white shadow-lg' : 'bg-black/50 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {val}%
                                    </button>
                                ))}
                                <input 
                                    type="number" 
                                    className="w-20 bg-black/50 border border-white/5 rounded-xl px-3 text-white outline-none focus:border-indigo-500 text-right font-medium"
                                    placeholder="Custom"
                                    value={slippage}
                                    onChange={(e) => setSlippage(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    {/* From Input Box */}
                    <div className="bg-black/40 rounded-3xl p-5 border border-white/5 mb-1 focus-within:border-indigo-500/40 focus-within:bg-indigo-500/5 transition-all group">
                        <div className="flex justify-between mb-3">
                            <label className="text-sm font-medium text-gray-400">You Pay</label>
                        </div>
                        <div className="flex justify-between items-center">
                            <input 
                                type="number"
                                placeholder="0"
                                value={hbarAmount}
                                onChange={(e) => setHbarAmount(e.target.value)}
                                className="bg-transparent text-5xl w-full outline-none font-bold text-white placeholder-gray-800 tracking-tight"
                            />
                            <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-2xl font-bold flex items-center space-x-2 border border-indigo-500/30 whitespace-nowrap">
                                <div className="w-5 h-5 rounded-full bg-indigo-400/20 flex items-center justify-center text-[10px]">ℏ</div>
                                <span>HBAR</span>
                            </div>
                        </div>
                    </div>

                    {/* Bridge Icon */}
                    <div className="flex justify-center -my-4 z-20 relative">
                        <div className="bg-gray-900 border-[6px] border-[#0a0a0a] p-2.5 rounded-2xl text-gray-400 hover:text-white hover:bg-indigo-600/20 cursor-pointer transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        </div>
                    </div>

                    {/* To Input Box */}
                    <div className="bg-black/40 rounded-3xl p-5 border border-white/5 mt-1 focus-within:bg-white/5 transition-all">
                        <div className="flex justify-between mb-3">
                            <label className="text-sm font-medium text-gray-400">You Receive</label>
                            {loading && <span className="text-xs text-indigo-400 animate-pulse font-medium">Fetching best route...</span>}
                        </div>
                        <div className="flex justify-between items-center">
                            <input 
                                readOnly
                                value={expectedOutput}
                                placeholder="0"
                                className="bg-transparent text-5xl w-full outline-none font-bold text-white placeholder-gray-800 tracking-tight cursor-not-allowed"
                            />
                            <div className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-2xl font-bold flex items-center space-x-2 border border-pink-500/30 whitespace-nowrap shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                                <span>MEME</span>
                            </div>
                        </div>
                        
                        {Number(expectedOutput) > 0 && (
                            <div className="mt-5 pt-4 border-t border-white/5 flex justify-between text-xs text-gray-400 font-medium">
                                <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Minimum Received
                                </span>
                                <span className="font-mono text-gray-300 bg-white/5 px-2 py-0.5 rounded">{minimumOutput} MEME</span>
                            </div>
                        )}
                    </div>

                    {status && (
                        <div className="mt-6 mb-2 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center text-sm text-indigo-200 animate-pulse font-medium">
                            {status}
                        </div>
                    )}

                    <button 
                        onClick={executeSwap}
                        disabled={!hbarAmount || Number(hbarAmount) <= 0 || state !== 'Connected'}
                        className="w-full mt-6 py-5 rounded-2xl font-bold text-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:shadow-none disabled:bg-gray-800 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed"
                    >
                        {state !== 'Connected' ? 'Connect Wallet to Trade' : 'Approve & Swap'}
                    </button>
                </div>
            </div>
        </main>
    );
}
