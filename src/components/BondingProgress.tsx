'use client';

import { motion } from 'framer-motion';

interface BondingProgressProps {
    currentHbar: number; // Current HBAR collected
    targetHbar?: number;  // Target for migration (e.g. 65k)
}

/**
 * Bonding Curve Progress Indicator
 * Visualizes the migration path to DEX liquidity.
 */
export default function BondingProgress({ currentHbar, targetHbar = 65000 }: BondingProgressProps) {
    const progress = Math.min((currentHbar / targetHbar) * 100, 100);
    const isCompleted = progress >= 100;

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Migration Progress</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-white">{progress.toFixed(1)}%</span>
                        {isCompleted && (
                            <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">SAUCER READY</span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Target</span>
                    <div className="text-[10px] font-black text-blue-500">{targetHbar.toLocaleString()} HBAR</div>
                </div>
            </div>

            {/* PROGRESS TRACK */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={`h-full relative ${isCompleted ? 'bg-blue-500 shadow-neon-blue' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </motion.div>
            </div>

            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
                <span>Bonding Layer</span>
                <span>DEX Layer</span>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
            `}</style>
        </div>
    );
}
