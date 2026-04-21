'use client';

import { motion } from 'framer-motion';

/**
 * Security Badge
 * Displays the renunciation status of the HTS token keys.
 */
export function SecurityBadge({ isLocked }: { isLocked: boolean }) {
    if (!isLocked) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-full shadow-neon-blue"
        >
            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.908-3.367 9.193-8 10.366-4.633-1.173-8-5.458-8-10.366 0-.68.056-1.35.166-2.001zm8.341 1.459a1 1 0 00-1.014-1.459L5.483 11.112a1 1 0 00.302 1.802l1.914.397-1.127 3.32a1 1 0 001.782.723l4.517-6.57a1 1 0 00-.314-1.552l-2.098-.435 1.05-3.141z" clipRule="evenodd" />
            </svg>
            <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Logic Locked</span>
        </motion.div>
    );
}

/**
 * Reaction Button
 * Interactive fire reaction with real-time count.
 */
interface ReactionButtonProps {
    id: string;
    count: number;
    onReact: () => void;
}

export function ReactionButton({ id, count, onReact }: ReactionButtonProps) {
    return (
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={onReact}
            className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 px-5 rounded-2xl transition-all"
        >
            <span className="text-sm">🔥</span>
            <span className="text-[11px] font-black text-white/50 group-hover:text-white transition-colors">{count}</span>
        </motion.button>
    );
}
