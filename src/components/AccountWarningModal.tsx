'use client';

import React from 'react';
import { useAccountCompatibility } from '../hooks/useAccountCompatibility';
import { AlertTriangle, PlusCircle, CreditCard } from 'lucide-react';

/**
 * Component: AccountWarningModal
 * Displays a persistent overlay if an incompatible account type is detected.
 */
export const AccountWarningModal = () => {
    const { isCompatible, keyType } = useAccountCompatibility();

    // Only show if Ed25519 is specifically detected
    if (isCompatible || keyType !== 'ED25519') return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[999] w-[95%] max-w-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-zinc-950/80 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                    <AlertTriangle size={24} />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-white font-bold text-lg">Legacy Account Detected (Ed25519)</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        You can still launch memes, but standard Swaps may require an <span className="text-white font-mono">ECDSA</span> account for full compatibility.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <a 
                        href="https://www.hashpack.app/blog/evm-compatible-accounts-on-hedera" 
                        target="_blank"
                        className="flex-1 md:flex-none px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-all text-center"
                    >
                        Learn More
                    </a>
                    <button 
                        onClick={() => { /* Consider adding a hide button state */ }}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-bold transition-all"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};
