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

        setStatus("Requesting wallet approval for SaucerSwap transaction...");

        try {
            // ACTIVE HEDERA SIGNING FLOW
            const { ContractExecuteTransaction, ContractId, Hbar, HbarUnit } = await import('@hashgraph/sdk');

            // Build the execution payload
            const routerId = "0.0.3959082"; // Example Testnet V2 Router
            
            const transaction = new ContractExecuteTransaction()
                .setContractId(ContractId.fromString(routerId))
                .setGas(1000000)
                .setPayableAmount(Hbar.from(Number(hbarAmount), HbarUnit.Hbar))
                .setFunction("swapExactETHForTokens", undefined /* Params encoded here */);

            // NATIVE SIGNING TRIGGER
            console.log(`Pushing Swap for ${targetTokenId} to HashPack...`);
            const response = await signer.executeTransaction(transaction);
            
            console.log("Swap successful:", response);
            setStatus(`Successfully swapped ${hbarAmount} HBAR for ${expectedOutput} tokens!`);
            setHbarAmount('');
            
        } catch (error: any) {
            console.error("Swap Error:", error);
            setStatus(error.message || "User rejected the signing request.");
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-20 px-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-md w-full z-10 flex flex-col space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-extrabold tracking-tight">DEX Swap</h1>
                    <WalletConnectButton />
                </div>

                <div className="bg-black/60 border border-white/10 p-6 rounded-[2rem] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm text-gray-400 font-medium tracking-wide">Native Bridge Active</span>
                        <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors group">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                    </div>

                    {showSettings && (
                        <div className="mb-6 p-5 bg-white/5 rounded-[1.5rem] border border-white/5 animate-fade-in shadow-inner">
                            <label className="text-sm text-gray-400 mb-3 block">Configure Token ID</label>
                            <input 
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 text-xs font-mono"
                                value={targetTokenId}
                                onChange={(e) => setTargetTokenId(e.target.value)}
                                placeholder="0.0.xxxxxx"
                            />
                            
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
                            </div>
                        </div>
                    )}

                    <div className="bg-black/40 rounded-3xl p-5 border border-white/5 mb-1 focus-within:border-indigo-500/40 transition-all group">
                        <div className="flex justify-between mb-3">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-tighter text-[10px]">You Pay</label>
                        </div>
                        <div className="flex justify-between items-center">
                            <input 
                                type="number"
                                placeholder="0"
                                value={hbarAmount}
                                onChange={(e) => setHbarAmount(e.target.value)}
                                className="bg-transparent text-5xl w-full outline-none font-black text-white placeholder-gray-900 tracking-tighter"
                            />
                            <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-2xl font-black flex items-center space-x-2 border border-indigo-500/30 whitespace-nowrap">
                                <span>HBAR</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center -my-4 z-20 relative">
                        <div className="bg-gray-900 border-[6px] border-[#0a0a0a] p-2.5 rounded-2xl text-gray-400 hover:text-white hover:bg-indigo-600/20 cursor-pointer transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-3xl p-5 border border-white/5 mt-1 focus-within:bg-white/5 transition-all">
                        <div className="flex justify-between mb-3">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-tighter text-[10px]">You Receive</label>
                            {loading && <span className="text-[10px] text-indigo-400 animate-pulse font-black uppercase">Routing...</span>}
                        </div>
                        <div className="flex justify-between items-center">
                            <input 
                                readOnly
                                value={expectedOutput}
                                placeholder="0"
                                className="bg-transparent text-5xl w-full outline-none font-black text-white placeholder-gray-900 tracking-tighter cursor-not-allowed"
                            />
                            <div className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-2xl font-black flex items-center space-x-2 border border-pink-500/30 whitespace-nowrap">
                                <span>TOKEN</span>
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div className="mt-6 mb-2 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center text-xs text-indigo-200 animate-pulse font-bold">
                            {status}
                        </div>
                    )}

                    <button 
                        onClick={executeSwap}
                        disabled={!hbarAmount || Number(hbarAmount) <= 0 || !isConnected}
                        className="w-full mt-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:grayscale disabled:shadow-none"
                    >
                        {!isConnected ? 'Connect Wallet' : 'Sign & Swap'}
                    </button>
                </div>
            </div>
        </main>
    );
}
