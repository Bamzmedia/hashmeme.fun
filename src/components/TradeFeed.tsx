'use client';

import { useState, useEffect } from 'react';
import { MirrorNodeService } from '@/services/MirrorNodeService';
import { HCSService } from '@/services/HCSService';

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

    useEffect(() => {
        // 1. Initial Load from Mirror Node (Historical)
        const fetchInitial = async () => {
            try {
                const mirrorService = MirrorNodeService.getInstance();
                const realActivity = await mirrorService.getLiveActivity(8);
                setActivities(realActivity);
            } catch (e) {
                console.error("Historical Load Failed");
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();

        // 2. Real-time Subscription via HCS
        const hcs = HCSService.getInstance();
        const unsubscribe = hcs.subscribe((msg) => {
            if (msg.type === 'LAUNCH' || msg.type === 'SWAP') {
                const newActivity: Activity = {
                    id: Math.random().toString(36).substring(7),
                    type: msg.type,
                    sender: msg.type === 'LAUNCH' ? msg.data.creator : msg.data.sender,
                    token: msg.type === 'LAUNCH' ? msg.data.symbol : msg.data.targetToken,
                    timestamp: (msg.timestamp / 1000).toString()
                };
                
                setActivities(prev => [newActivity, ...prev].slice(0, 8));
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading && activities.length === 0) {
        return (
            <div className="frosted p-10 flex flex-col h-full rounded-[3rem] animate-pulse">
                <div className="h-4 w-24 bg-white/5 mb-8"></div>
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-14 bg-white/5 w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="frosted p-10 flex flex-col h-full rounded-[3rem] relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.4em] flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 mr-4 animate-ping rounded-full"></span>
                    HCS Real-time Feed
                </h3>
            </div>

            <div className="flex-grow space-y-10 overflow-hidden relative">
                {activities.map((activity) => (
                    <div 
                        key={activity.id} 
                        className="flex items-center space-x-8 pb-10 border-b border-white/5 last:border-0"
                    >
                        <div className="w-10 h-10 frosted border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-bold text-[9px]">{activity.type === 'LAUNCH' ? 'NEW' : 'HTS'}</span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start">
                                <span className="text-[11px] font-black uppercase text-white truncate">
                                    {activity.sender.length > 20 ? activity.sender.substring(0, 10) + '...' : activity.sender}
                                </span>
                                <span className="text-[9px] font-mono text-white/20">
                                    {new Date(Number(activity.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 mt-2">
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{activity.type === 'LAUNCH' ? 'Created' : 'Swapped'}</span>
                                <span className="text-[10px] text-blue-400 font-black tracking-tighter italic">{activity.token}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
