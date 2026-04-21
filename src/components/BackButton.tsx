'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <button 
            onClick={handleBack}
            className="group flex items-center space-x-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-500 ease-out shadow-lg"
        >
            <ArrowLeft 
                className="w-4 h-4 stroke-[2.5px] group-hover:-translate-x-1.5 transition-transform duration-500 ease-out" 
            />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Go Back</span>
        </button>
    );
}
