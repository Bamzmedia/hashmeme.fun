'use client';

import { useState } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { useHederaSigner } from '@/hooks/useHederaSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import { useSaucerSwapQuote } from '@/hooks/useSaucerSwapQuote';

export default function SwapPage() {
    const { accountId, isConnected } = useHederaAccount();
    const { signer } = useHederaSigner();
    
    // Dynamic token mapping
    const [targetTokenId, setTargetTokenId] = useState<string>("0.0.1234567"); 
    const [hbarAmount, setHbarAmount] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(5.0); 
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('');
    
    // Fetch live quote leveraging our custom V2 AMM hook
    const { expectedOutput, minimumOutput, loading } = useSaucerSwapQuote(hbarAmount, slippage, "HBAR", targetTokenId);

    const executeSwap = async () => {
        if (!isConnected || !accountId || !signer) {
            setStatus("Please connect your wallet to proceed.");
            return;
        }

        setStatus("Requesting wallet approval for SaucerSwap...");

        try {
            const { ContractExecuteTransaction, ContractId, Hbar, HbarUnit } = await import('@hashgraph/sdk');

            // Build the execution payload
            const routerId = "0.0.3959082"; // Example Testnet V2 Router
            
            const transaction = new ContractExecuteTransaction()
                .setContractId(ContractId.fromString(routerId))
                .setGas(1000000)
                .setPayableAmount(Hbar.from(Number(hbarAmount), HbarUnit.Hbar))
                .setFunction("swapExactETHForTokens", undefined /* Params encoded here in real implementation */);

            // NATIVE SIGNING TRIGGER
            console.log(`Pushing Native Swap for ${targetTokenId} to Wallet...`);
            const response = await signer.executeTransaction(transaction);
            
            console.log("Swap response received:", response);
            setStatus(`Success! Swapped ${hbarAmount} HBAR.`);
            setHbarAmount('');
            
        } catch (error: any) {
            console.error("Swap Error:", error);
            setStatus(error.message || "User rejected the request.");
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-16 px-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-md w-full z-10 flex flex-col space-y-6 pt-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-black uppercase tracking-widest">DEX Swap</h1>
                    <WalletConnectButton />
                </div>

                <div className="bg-black/60 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Bridge Active</span>
                        <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors group">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                    </div>

                    {showSettings && (
                        <div className="mb-6 p-5 bg-white/5 rounded-[1.5rem] border border-white/5 animate-fade-in">
                            <label className="text-[9px] font-black uppercase text-gray-500 mb-3 block">Configure Token ID</label>
                            <input 
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white mb-4 text-xs font-mono"
                                value={targetTokenId}
                                onChange={(e) => setTargetTokenId(e.target.value)}
                            />
                            
                            <label className="text-[9px] font-black uppercase text-gray-500 mb-3 block">Slippage Tolerance</label>
                            <div className="flex space-x-2">
                                {[0.5, 1, 5].map(val => (
                                    <button 
                                        key={val}
                                        onClick={() => setSlippage(val)}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-colors ${slippage === val ? 'bg-indigo-500 text-white shadow-lg' : 'bg-black/50 text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {val}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-black/40 rounded-3xl p-5 border border-white/5 mb-1 focus-within:border-indigo-500/40 transition-all">
                        <div className="flex justify-between mb-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">You Pay</label>
                        </div>
                        <div className="flex justify-between items-center">
                            <input 
                                type="number"
                                placeholder="0"
                                value={hbarAmount}
                                onChange={(e) => setHbarAmount(e.target.value)}
                                className="bg-transparent text-4xl w-full outline-none font-black text-white placeholder-gray-900 tracking-tighter"
                            />
                            <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-2xl font-black text-xs border border-indigo-500/30">
                                <span>HBAR</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center -my-4 z-20 relative">
                        <div className="bg-gray-900 border-[6px] border-[#0a0a0a] p-2 rounded-xl text-gray-500 hover:text-white transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-3xl p-5 border border-white/5 mt-1">
                        <div className="flex justify-between mb-3">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">You Receive</label>
                            {loading && <span className="text-[9px] text-indigo-400 animate-pulse font-black uppercase">Routing</span>}
                        </div>
                        <div className="flex justify-between items-center">
                            <input 
                                readOnly
                                value={expectedOutput}
                                placeholder="0"
                                className="bg-transparent text-4xl w-full outline-none font-black text-white placeholder-gray-900 tracking-tighter"
                            />
                            <div className="bg-pink-500/20 text-pink-300 px-3 py-1.5 rounded-2xl font-black text-xs border border-pink-500/30">
                                <span>TOKEN</span>
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center text-[10px] text-indigo-200 animate-pulse font-black uppercase tracking-widest">
                            {status}
                        </div>
                    )}

                    <button 
                        onClick={executeSwap}
                        disabled={!hbarAmount || Number(hbarAmount) <= 0 || !isConnected}
                        className="w-full mt-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {!isConnected ? 'Connect Wallet' : 'Sign & Swap'}
                    </button>
                </div>
            </div>
        </main>
    );
}
