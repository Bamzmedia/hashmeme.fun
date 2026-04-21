'use client';

import { useState, useEffect, Suspense } from 'react';
import { useHederaAccount } from '@/hooks/useHederaAccount';
import { useHederaSigner } from '@/hooks/useHederaSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import { useSaucerSwapQuote } from '@/hooks/useSaucerSwapQuote';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundMesh from '@/components/effects/BackgroundMesh';
import { triggerSuccessConfetti } from '@/components/effects/ConfettiManager';
import { useSearchParams } from 'next/navigation';
import { MirrorNodeService } from '@/services/MirrorNodeService';

interface TokenOption {
    id: string;
    name: string;
    symbol: string;
    image_url: string;
    decimals: number;
}

const PRESET_TOKENS: TokenOption[] = [
    { id: "0.0.5241088", name: "GlowSwap Genesis", symbol: "GLOW", decimals: 8, image_url: "https://gen.pollinations.ai/image/majestic_radiant_energy_core_neon_blue_purple_glowing_highly_detailed?width=1024&height=1024&nologo=true" },
    { id: "0.0.731861", name: "SauceToken", symbol: "SAUCE", decimals: 6, image_url: "https://www.saucerswap.finance/images/tokens/sauce.svg" },
    { id: "0.0.456858", name: "USD Coin", symbol: "USDC", decimals: 6, image_url: "https://www.saucerswap.finance/images/tokens/usdc.svg" },
    { id: "0.0.859887", name: "Cloudly", symbol: "CLXY", decimals: 8, image_url: "https://www.saucerswap.finance/images/tokens/clxy.png" },
];

function SwapContent() {
    const { accountId, isConnected } = useHederaAccount();
    const { signer } = useHederaSigner();
    const searchParams = useSearchParams();
    
    // State
    const [targetTokenId, setTargetTokenId] = useState<string>(PRESET_TOKENS[0].id);
    const [selectedToken, setSelectedToken] = useState<TokenOption>(PRESET_TOKENS[0]);
    const [hbarAmount, setHbarAmount] = useState<string>('');
    const [slippage, setSlippage] = useState<number>(1.0); 
    const [showSelector, setShowSelector] = useState<boolean>(false);
    const [isAssociated, setIsAssociated] = useState<boolean>(true);
    const [status, setStatus] = useState<string>('');
    const [loadingAction, setLoadingAction] = useState<boolean>(false);
    
    // Sync with URL parameter & Association Check
    useEffect(() => {
        const id = searchParams.get('id') || PRESET_TOKENS[0].id;
        setTargetTokenId(id);
        const preset = PRESET_TOKENS.find(t => t.id === id);
        if (preset) setSelectedToken(preset);

        if (isConnected && accountId) {
            checkAssociation(accountId, id);
        }
    }, [searchParams, isConnected, accountId]);

    const checkAssociation = async (accId: string, tokId: string) => {
        const mirror = MirrorNodeService.getInstance();
        const associated = await mirror.isTokenAssociated(accId, tokId);
        setIsAssociated(associated);
    };

    const handleTokenSelect = (token: TokenOption) => {
        setSelectedToken(token);
        setTargetTokenId(token.id);
        setShowSelector(false);
        if (accountId) checkAssociation(accountId, token.id);
    };

    const { expectedOutput, loading } = useSaucerSwapQuote(hbarAmount, slippage, "HBAR", targetTokenId);

    const associateToken = async () => {
        if (!signer || !accountId) return;
        setLoadingAction(true);
        setStatus(`Associating ${selectedToken.symbol} with your Radiant Identity...`);
        try {
            const { TokenAssociateTransaction, AccountId } = await import('@hashgraph/sdk');
            const transaction = new TokenAssociateTransaction()
                .setAccountId(AccountId.fromString(accountId))
                .setTokenIds([selectedToken.id]);
            
            await signer.executeTransaction(transaction);
            setIsAssociated(true);
            setStatus(`Success! ${selectedToken.symbol} is now associated.`);
        } catch (e: any) {
            setStatus(`Association Failed: ${e.message}`);
        } finally {
            setLoadingAction(false);
        }
    };

    const executeAtomicSwap = async () => {
        if (!isConnected || !accountId || !signer) {
            setStatus("Please connect your wallet to proceed.");
            return;
        }

        setLoadingAction(true);
        setStatus(`Initiating Atomic Swap: HBAR -> ${selectedToken.symbol}...`);

        try {
            const { TransferTransaction, AccountId, Hbar, TokenId } = await import('@hashgraph/sdk');
            
            // In a production environment, this would be a Liquidity Pool contract or Account
            const protocolPoolId = process.env.NEXT_PUBLIC_OPERATOR_ID || "0.0.8639496"; 
            
            // Calculate raw token amount based on decimals
            const tokenAmountRaw = Math.floor(Number(expectedOutput) * Math.pow(10, selectedToken.decimals));
            
            const transaction = new TransferTransaction()
                .addHbarTransfer(accountId, Hbar.fromString(`-${hbarAmount}`))
                .addHbarTransfer(protocolPoolId, Hbar.fromString(hbarAmount))
                .addTokenTransfer(TokenId.fromString(selectedToken.id), protocolPoolId, -tokenAmountRaw)
                .addTokenTransfer(TokenId.fromString(selectedToken.id), accountId, tokenAmountRaw);

            await signer.executeTransaction(transaction);
            
            triggerSuccessConfetti();

            try {
                const hcs = (await import('@/services/HCSService')).HCSService.getInstance();
                await hcs.publishEvent({
                    type: 'SWAP',
                    data: {
                        sender: accountId,
                        hbarAmount: hbarAmount,
                        targetToken: selectedToken.symbol,
                        tokenId: selectedToken.id
                    }
                });
            } catch (hcsErr) {
                console.warn("HCS Broadcast failed:", hcsErr);
            }
            
            setStatus(`Atomic Swap Successful: Received ${expectedOutput} ${selectedToken.symbol}.`);
            setHbarAmount('');
            
        } catch (error: any) {
            setStatus(error.message || "Swap rejected by Ledger.");
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#05070a] text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white relative">
            <BackgroundMesh />

            <nav className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-black/40 backdrop-blur-md z-50 px-8 flex items-center justify-between">
                <div className="flex items-center space-x-12">
                    <Link href="/" className="flex items-center space-x-3 group outline-none">
                        <div className="p-1 rounded-sm border border-blue-500 group-hover:rotate-45 transition-transform duration-500 flex items-center justify-center">
                            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 shadow-neon-blue"></div>
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

            <div className="flex-grow flex items-center justify-center pt-24 px-4 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-md w-full glow-card rounded-[2.5rem] p-10 shadow-radiant-lg relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                    
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-1 glow-text">Radiant Exchange v3.0</h2>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Atomic HBAR/HTS Transfers</p>
                        </div>
                        <button 
                            onClick={() => setShowSelector(!showSelector)}
                            className={`p-2.5 transition-all border outline-none rounded-xl ${showSelector ? 'border-blue-500 bg-blue-500/10 text-white shadow-neon-blue' : 'border-white/10 text-white/30 hover:text-white'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v4M7 7h10"></path></svg>
                        </button>
                    </div>

                    <AnimatePresence>
                        {showSelector && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 p-8 flex flex-col space-y-4"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest">Select Radiant Asset</h3>
                                    <button onClick={() => setShowSelector(false)} className="p-2 text-white/40 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                </div>
                                <div className="space-y-3 overflow-y-auto pr-2">
                                    {PRESET_TOKENS.map((token) => (
                                        <button 
                                            key={token.id}
                                            onClick={() => handleTokenSelect(token)}
                                            className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-full border border-white/5 overflow-hidden"><img src={token.image_url} alt={token.symbol} className="w-full h-full object-cover" /></div>
                                                <div className="text-left">
                                                    <div className="text-xs font-black uppercase">{token.name}</div>
                                                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{token.symbol}</div>
                                                </div>
                                            </div>
                                            {targetTokenId === token.id && <div className="w-2 h-2 bg-blue-500 rounded-full shadow-neon-blue"></div>}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2 relative z-10">
                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all focus-within:border-blue-500/50">
                            <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                <span>Input Protocol</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input 
                                    type="number"
                                    placeholder="0"
                                    value={hbarAmount}
                                    onChange={(e) => setHbarAmount(e.target.value)}
                                    className="bg-transparent text-5xl font-black w-full outline-none placeholder:text-white/5 tracking-tighter"
                                />
                                <div className="flex items-center space-x-2">
                                    <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 px-2">MAX</button>
                                    <div className="px-4 py-2 bg-white text-black font-black text-[11px] rounded-lg">HBAR</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center -my-6 relative z-20">
                            <div className="w-12 h-12 glow-card border border-white/10 flex items-center justify-center shadow-radiant hover:rotate-180 transition-transform duration-500 cursor-pointer rounded-2xl">
                                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl shadow-inner">
                            <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                <span>Output Protocol (Estimated)</span>
                                {loading && <span className="text-[9px] text-blue-500 font-bold animate-pulse">Calculating...</span>}
                            </div>
                            <div className="flex justify-between items-center">
                                <input 
                                    readOnly
                                    value={expectedOutput}
                                    placeholder="0"
                                    className="bg-transparent text-5xl font-black w-full outline-none placeholder:text-white/5 tracking-tighter text-blue-500 glow-text"
                                />
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => setShowSelector(true)} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                        <div className="w-8 h-8 rounded-full border border-blue-500/20 overflow-hidden"><img src={selectedToken.image_url} alt="token" className="w-full h-full object-cover" /></div>
                                        <div className="px-4 py-2 border border-blue-500/30 text-blue-400 font-black text-[11px] rounded-lg bg-blue-500/5 uppercase tracking-tighter">{selectedToken.symbol}</div>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] truncate flex items-center justify-between">
                                <span>{selectedToken.name}</span>
                                {!isAssociated && isConnected && <span className="text-purple-400 animate-pulse">Association Required</span>}
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

                    {!isAssociated && isConnected ? (
                        <button 
                            onClick={associateToken}
                            disabled={loadingAction}
                            className="w-full mt-10 py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-radiant active:scale-[0.98] relative z-10 rounded-[1.5rem]"
                        >
                            {loadingAction ? 'Signing Association...' : `Radiant Associate: ${selectedToken.symbol}`}
                        </button>
                    ) : (
                        <button 
                            onClick={executeAtomicSwap}
                            disabled={!hbarAmount || Number(hbarAmount) <= 0 || !isConnected || loadingAction}
                            className="w-full mt-10 py-6 bg-white text-black hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-radiant active:scale-[0.98] disabled:opacity-30 disabled:grayscale relative z-10 rounded-[1.5rem]"
                        >
                            {!isConnected ? 'Initialize Identity' : loadingAction ? 'Hub Consensus...' : `Verify & Execute Swap`}
                        </button>
                    )}
                    
                    <div className="mt-6 text-center">
                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">Protocol Bridge: {targetTokenId}</span>
                    </div>
                </motion.div>
            </div>

            <footer className="py-20 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.5em]">
                &copy; 2026 GlowSwap Protocol &bull; Radiant Build v3.0.0
            </footer>
        </main>
    );
}

export default function SwapPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        }>
            <SwapContent />
        </Suspense>
    );
}
