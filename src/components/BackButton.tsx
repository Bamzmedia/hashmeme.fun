'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        // Fallback safety: Check if there is a browser history
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            // Default to home if no history
            router.push('/');
        }
    };

    return (
        <button 
            onClick={handleBack}
            className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-bold tracking-tight">Go Back</span>
        </button>
    );
}
