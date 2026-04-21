'use client';

import { useState, useEffect } from 'react';
import { TokenomicsService } from '@/services/TokenomicsService';

interface VestingTrackerProps {
    totalAllocation: number;
    months: number;
    symbol: string;
}

export default function VestingTracker({ totalAllocation, months, symbol }: VestingTrackerProps) {
    const service = TokenomicsService.getInstance();
    const [schedule, setSchedule] = useState<any[]>([]);

    useEffect(() => {
        const generated = service.generateVestingSchedule(totalAllocation, months);
        setSchedule(generated);
    }, [totalAllocation, months]);

    const released = schedule.filter(s => s.status === 'Released').length;
    const progress = (released / schedule.length) * 100;

    return (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Vesting Progress</h3>
                    <div className="text-xl font-black text-white">{released} / {schedule.length} Months</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-indigo-400 mb-1">Locked Supply</div>
                    <div className="text-lg font-black text-indigo-300">
                        {((totalAllocation * (schedule.length - released)) / schedule.length).toLocaleString()} {symbol}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Schedule List (Shortened) */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {schedule.map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-tighter">
                        <span className="text-gray-400">Month {s.month} - {s.date}</span>
                        <span className={s.status === 'Locked' ? 'text-pink-500' : 'text-emerald-400'}>
                            {s.amount} {symbol} ({s.status})
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
