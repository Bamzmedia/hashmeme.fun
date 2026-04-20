import { useState, useEffect } from 'react';

export interface TradeEvent {
    id: string;
    type: 'BUY' | 'SELL';
    tokenSymbol: string;
    amount: string;
    hbarValue: string;
    timestamp: Date;
    txId: string;
}

export function useTradeFeed() {
    const [trades, setTrades] = useState<TradeEvent[]>([]);

    useEffect(() => {
        // Initial Mock Seed
        let currentTrades: TradeEvent[] = [
            { id: "1", type: "BUY", tokenSymbol: "DOGE", amount: "52000", hbarValue: "45.2", timestamp: new Date(Date.now() - 5000), txId: "0.0.123@12345" },
            { id: "2", type: "SELL", tokenSymbol: "PEPE", amount: "15000", hbarValue: "20.1", timestamp: new Date(Date.now() - 15000), txId: "0.0.124@12347" },
            { id: "3", type: "BUY", tokenSymbol: "SHIB", amount: "5000000", hbarValue: "112.5", timestamp: new Date(Date.now() - 25000), txId: "0.0.125@12349" },
        ];
        
        setTrades(currentTrades);

        // Simulate WebSocket / Polling from Mirror Node Smart Contract Events
        const symbols = ["DOGE", "PEPE", "SHIB", "FLOKI", "WOJ", "HBARB"];
        
        const generateTrade = () => {
            const isBuy = Math.random() > 0.4; // Slightly more buys for hype
            const newTrade: TradeEvent = {
                id: Math.random().toString(),
                type: isBuy ? 'BUY' : 'SELL',
                tokenSymbol: symbols[Math.floor(Math.random() * symbols.length)],
                amount: Math.floor(Math.random() * 50000).toString(),
                hbarValue: (Math.random() * 200).toFixed(2),
                timestamp: new Date(),
                txId: `0.0.${Math.floor(Math.random() * 999)}@${Date.now().toString().slice(-5)}`
            };
            
            // Keep feed size manageable (last 20)
            setTrades(prev => [newTrade, ...prev].slice(0, 20));
        };

        const interval = setInterval(generateTrade, 3500); // New trade every 3.5 seconds
        return () => clearInterval(interval);

    }, []);

    return { trades };
}
