'use client';

import { useState, useEffect } from 'react';
import { MirrorNodeService } from '@/services/MirrorNodeService';

interface Activity {
    id: string;
    type: string;
    sender: string;
    token: string;
    timestamp: string;
}

export default function TradeFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchActivity = async () => {
        try {
            const mirrorService = MirrorNodeService.getInstance();
            const realActivity = await mirrorService.getLiveActivity(12);
            setActivities(realActivity);
        } catch (e) {
            console.error("Failed to fetch live activity");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
        const interval = setInterval(fetchActivity, 15000);
        return () => clearInterval(interval);
    }, []);

    if (loading && activities.length === 0) {
        return (
            <div className="bg-transparent border border-white/10 p-8 flex flex-col h-full">
                <div className="h-4 w-24 border-b border-white/20 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 border border-white/5 w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-transparent border border-white/10 p-8 flex flex-col h-full relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] flex items-center">
                    <span className="w-1.5 h-1.5 bg-white mr-3 animate-ping"></span>
                    Live Ledger
                </h3>
            </div>

            <div className="flex-grow space-y-6 overflow-hidden relative">
                {activities.map((activity, i) => (
                    <div 
                        key={activity.id} 
                        className="flex items-center space-x-6 pb-6 border-b border-white/5 last:border-0"
                    >
                        <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-white/60 font-medium text-[8px]">HTS</span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-white truncate">
                                    {activity.sender}
                                </span>
                                <span className="text-[8px] font-mono text-white/30">
                                    {new Date(Number(activity.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[9px] text-white/20 font-bold uppercase tracking-tight">Syncing</span>
                                <span className="text-[9px] text-white font-bold tracking-widest">{activity.token}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-4 border-t border-white/10 text-center">
                <p className="text-[8px] text-white/20 font-bold uppercase tracking-[0.4em]">Node 0.0.3 Verification</p>
            </div>
        </div>
    );
}
