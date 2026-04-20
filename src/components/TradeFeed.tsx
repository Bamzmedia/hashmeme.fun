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
        const interval = setInterval(fetchActivity, 15000); // 15s polling for new ledger events
        return () => clearInterval(interval);
    }, []);

    if (loading && activities.length === 0) {
        return (
            <div className="bg-black/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-full animate-pulse">
                <div className="h-4 w-24 bg-white/5 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-white/5 rounded-2xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-full shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
                    Live Activity
                </h3>
                <span className="text-[10px] font-black text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">Real-Time</span>
            </div>

            <div className="flex-grow space-y-4 overflow-hidden relative">
                {activities.map((activity, i) => (
                    <div 
                        key={activity.id} 
                        className="flex items-center space-x-4 p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all group/item animate-fade-in"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-indigo-500/20 transition-colors">
                            <span className="text-indigo-400 font-black text-[10px]">HTS</span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black text-white hover:text-indigo-300 transition-colors cursor-pointer truncate">
                                    {activity.sender}
                                </span>
                                <span className="text-[8px] font-mono text-gray-600">
                                    {new Date(Number(activity.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Transferred</span>
                                <span className="text-[10px] text-emerald-400 font-black tracking-widest">{activity.token}</span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Visual Fader to Bottom */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.2em]">Monitoring Consensus Node 0.0.3</p>
            </div>
        </div>
    );
}
