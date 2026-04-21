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
import BackButton from '@/components/BackButton';

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

function FluxChart() {
    return (
        <div className="w-full h-full relative flex flex-col justify-between">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Radiant Flux Monitor</h3>
                    <div className="text-3xl font-black glow-text tracking-tighter">98.4% HEELTH</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">24H Volume</div>
                    <div className="text-xl font-black text-white/60 tracking-tight font-mono">$1.24M</div>
                </div>
            </div>

            <div className="flex-grow flex items-end space-x-1 relative">
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
                
                {/* Mock Chart SVG */}
                <svg className="w-full h-full text-blue-500/40" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M0,150 Q50,140 100,160 T200,120 T300,140 T400,100"
                    />
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        transition={{ delay: 1.5 }}
                        fill="currentColor"
                        d="M0,150 Q50,140 100,160 T200,120 T300,140 T400,100 L400,200 L0,200 Z"
                    />
                </svg>

                {/* Animated Pulsing Dots */}
                <motion.div 
                    animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute bottom-[40%] right-[10%] w-3 h-3 bg-blue-500 rounded-full shadow-neon-blue"
                />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                    { label: 'Vol (24h)', val: '+14%', color: 'text-blue-500' },
                    { label: 'HTS Flux', val: 'Active', color: 'text-purple-500' },
                    { label: 'Latency', val: '2.4s', color: 'text-white/40' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[8px] font-bold uppercase tracking-widest text-white/20 mb-1">{stat.label}</div>
                        <div className={`text-xs font-black ${stat.color}`}>{stat.val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

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
            const protocolPoolId = process.env.NEXT_PUBLIC_OPERATOR_ID || "0.0.8639496"; 
            const tokenAmountRaw = Math.floor(Number(expectedOutput) * Math.pow(10, selectedToken.decimals));
            
            const transaction = new TransferTransaction()
                .addHbarTransfer(accountId, Hbar.fromString(`-${hbarAmount}`))
                .addHbarTransfer(protocolPoolId, Hbar.fromString(hbarAmount))
                .addTokenTransfer(TokenId.fromString(selectedToken.id), protocolPoolId, -tokenAmountRaw)
                .addTokenTransfer(TokenId.fromString(selectedToken.id), accountId, tokenAmountRaw);

            await signer.executeTransaction(transaction);
            triggerSuccessConfetti();
            
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
                        <Link href="/leaderboard" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Leaderboard</Link>
                        <Link href="/stake" className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Staking</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <WalletConnectButton />
                </div>
            </nav>

            {/* MARQUEE TICKER */}
            <div className="fixed top-20 left-0 w-full overflow-hidden bg-blue-500/5 py-3 border-b border-white/5 z-40">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[1, 2, 3].map(set => (
                        <div key={set} className="flex space-x-12 px-6">
                            {PRESET_TOKENS.map(t => (
                                <div key={t.id} className="flex items-center space-x-2">
                                    <span className="text-[8px] font-black uppercase text-white/40">{t.symbol}</span>
                                    <span className="text-[10px] font-mono text-blue-400 font-bold">$1.45</span>
                                    <span className="text-[8px] text-green-400 font-bold">+2.4%</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col items-center justify-center pt-48 pb-32 px-6 relative z-10">
                <div className="w-full flex justify-start mb-12">
                    <BackButton />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full h-full">
                    
                    {/* LEFT PANEL: ANALYTICS */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="glow-card rounded-[3rem] p-12 hidden lg:flex flex-col border border-white/5 shadow-radiant"
                    >
                        <FluxChart />
                    </motion.div>

                    {/* RIGHT PANEL: SWAP */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full flex justify-center lg:justify-start"
                    >
                        <div className="max-w-md w-full glow-card rounded-[2.5rem] p-10 shadow-radiant-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                            
                            <div className="flex justify-between items-center mb-10 relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] glow-text">Radiant Exchange</h3>
                                <button onClick={() => setShowSelector(!showSelector)} className="p-2.5 rounded-xl border border-white/10 text-white/30 hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v4M7 7h10"></path></svg></button>
                            </div>

                            <AnimatePresence>
                                {showSelector && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 p-8 flex flex-col"
                                    >
                                        <div className="flex justify-between items-center mb-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Asset Selection</span>
                                            <button onClick={() => setShowSelector(false)}><svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                        </div>
                                        <div className="space-y-3 overflow-y-auto pr-2">
                                            {PRESET_TOKENS.map(t => (
                                                <button key={t.id} onClick={() => handleTokenSelect(t)} className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-blue-500/30 transition-all">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/5"><img src={t.image_url} alt={t.symbol} className="w-full h-full object-cover" /></div>
                                                        <div className="text-left"><div className="text-xs font-black uppercase tracking-tight">{t.name}</div><div className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">{t.id}</div></div>
                                                    </div>
                                                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-blue-400">{t.symbol}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2 relative z-10">
                                {/* Input Card */}
                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all focus-within:border-blue-500/50">
                                    <div className="flex justify-between items-center mb-4 text-[9px] font-bold text-white/20 uppercase tracking-widest"><span>Input</span><span className="font-mono">Bal: 0.0</span></div>
                                    <div className="flex justify-between items-center">
                                        <input type="number" placeholder="0" value={hbarAmount} onChange={(e) => setHbarAmount(e.target.value)} className="bg-transparent text-5xl font-black w-full outline-none placeholder:text-white/5 tracking-tighter" />
                                        <div className="px-4 py-2 bg-white text-black font-black text-[11px] rounded-lg">HBAR</div>
                                    </div>
                                </div>

                                <div className="flex justify-center -my-6 relative z-20">
                                    <div className="w-12 h-12 glow-card border border-white/10 flex items-center justify-center shadow-radiant hover:rotate-180 transition-transform duration-500 rounded-2xl bg-black">
                                        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                                    </div>
                                </div>

                                {/* Output Card */}
                                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl shadow-inner">
                                    <div className="flex justify-between items-center mb-4 text-[9px] font-bold text-blue-400 uppercase tracking-widest"><span>Estimated Output</span>{loading && <span className="animate-pulse">Fluxing...</span>}</div>
                                    <div className="flex justify-between items-center">
                                        <input readOnly value={expectedOutput} placeholder="0" className="bg-transparent text-5xl font-black w-full outline-none placeholder:text-white/2 tracking-tighter text-blue-500 glow-text" />
                                        <button onClick={() => setShowSelector(true)} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-500/20"><img src={selectedToken.image_url} alt="t" className="w-full h-full object-cover" /></div>
                                            <div className="px-4 py-2 border border-blue-500/30 text-blue-400 font-black text-[11px] rounded-lg bg-blue-500/5">{selectedToken.symbol}</div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {status && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-5 bg-blue-500/10 border border-blue-500/20 text-center text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] rounded-2xl glow-text">
                                    {status}
                                </motion.div>
                            )}

                            {!isAssociated && isConnected ? (
                                <button onClick={associateToken} disabled={loadingAction} className="w-full mt-10 py-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-radiant rounded-[1.5rem]">{loadingAction ? 'Signing...' : `Radiant Associate: ${selectedToken.symbol}`}</button>
                            ) : (
                                <button onClick={executeAtomicSwap} disabled={!hbarAmount || Number(hbarAmount) <= 0 || !isConnected || loadingAction} className="w-full mt-10 py-6 bg-white text-black hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-radiant rounded-[1.5rem] disabled:opacity-20 animate-glow-pulse-slow">
                                    {loadingAction ? 'Hub Consensus...' : 'Execute Radiant Swap'}
                                </button>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>

            <footer className="py-20 text-center text-white/10 text-[9px] font-bold uppercase tracking-[0.5em]">
                &copy; 2026 GlowSwap Protocol &bull; Radiant Build v4.0.0
            </footer>
        </main>
    );
}

export default function SwapPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#05070a] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-purple-500 rounded-full animate-spin"></div></div>}>
            <SwapContent />
        </Suspense>
    );
}
