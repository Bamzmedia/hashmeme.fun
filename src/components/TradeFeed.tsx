'use client';

import { useState, useEffect } from 'react';

interface Trade {
    id: string;
    type: 'buy' | 'sell';
    token: string;
    amount: string;
    time: string;
    value: string;
}

export default function TradeFeed() {
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        // Mocking some live feed data for the premium feel
        const mockTrades: Trade[] = [
            { id: '1', type: 'buy', token: 'DOGE', amount: '12,500', time: '2s ago', value: '45.2 HBAR' },
            { id: '2', type: 'sell', token: 'PEPE', amount: '42,000', time: '5s ago', value: '120.8 HBAR' },
            { id: '3', type: 'buy', token: 'CAT', amount: '1,200', time: '12s ago', value: '12.4 HBAR' },
            { id: '4', type: 'buy', token: 'MOON', amount: '500', time: '15s ago', value: '98.0 HBAR' },
            { id: '5', type: 'sell', token: 'DOGE', amount: '2,000', time: '22s ago', value: '8.2 HBAR' },
        ];
        setTrades(mockTrades);

        const interval = setInterval(() => {
            setTrades(prev => {
                const newTrade: Trade = {
                    id: Date.now().toString(),
                    type: Math.random() > 0.4 ? 'buy' : 'sell',
                    token: ['DOGE', 'PEPE', 'CAT', 'MOON'][Math.floor(Math.random() * 4)],
                    amount: (Math.random() * 10000).toFixed(0),
                    time: 'Just now',
                    value: (Math.random() * 100).toFixed(1) + ' HBAR'
                };
                return [newTrade, ...prev.slice(0, 7)];
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/60 border border-white/5 rounded-[2rem] p-8 backdrop-blur-2xl h-full flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Pulse Activity</h2>
                <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live</span>
                </div>
            </div>

            <div className="flex-grow space-y-6 overflow-hidden relative">
                {trades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl animate-fade-in group hover:bg-white/5 transition-all">
                        <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] border shadow-sm ${
                                trade.type === 'buy' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                            }`}>
                                {trade.type.toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">{trade.token}</div>
                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{trade.time}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-gray-200">{trade.amount}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{trade.value}</div>
                        </div>
                    </div>
                ))}
                
                {/* Visual fade at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
            </div>
        </div>
    );
}
