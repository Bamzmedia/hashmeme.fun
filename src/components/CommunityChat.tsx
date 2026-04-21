'use client';

import { useState, useRef, useEffect } from 'react';
import { useCommunityChat } from '@/hooks/useCommunityChat';
import { useHederaAccount } from '@/hooks/useHederaAccount';

export default function CommunityChat() {
    const { messages, loading, sending, sendMessage, chatLimit } = useCommunityChat();
    const { accountId, isConnected } = useHederaAccount();
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || sending || !isConnected) return;

        try {
            await sendMessage(inputText);
            setInputText('');
        } catch (e: any) {
            console.error("HCS Error:", e.message);
        }
    };

    return (
        <div className="bg-transparent border border-white/10 p-8 flex flex-col h-[500px] relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-4">
                    <div className="w-1.5 h-1.5 bg-white"></div>
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Community Sync</h3>
                </div>
                <div className="text-[8px] font-bold text-white/30 uppercase tracking-widest border border-white/10 px-3 py-1">
                    Consensus Active
                </div>
            </div>

            {/* MESSAGE LIST */}
            <div 
                ref={scrollRef}
                className="flex-grow space-y-8 overflow-y-auto pr-4 custom-scrollbar mb-8"
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em] animate-pulse">Retrieving History...</div>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => {
                        const isMe = accountId && msg.sender === accountId;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-fade-in`}>
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-tight">
                                        {isMe ? 'You' : msg.sender}
                                    </span>
                                    <span className="text-[8px] text-white/20 font-mono">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`p-4 border max-w-[90%] text-[11px] leading-relaxed ${
                                    isMe 
                                    ? 'bg-white text-black border-white' 
                                    : 'bg-transparent border-white/10 text-white'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <p className="text-[9px] text-white font-bold uppercase tracking-widest">No messages on current topic</p>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSend} className="mt-auto">
                <div className="relative">
                    <input 
                        type="text"
                        value={inputText}
                        disabled={!isConnected || sending}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type message..."
                        maxLength={chatLimit}
                        className="w-full bg-transparent border border-white/20 px-6 py-4 text-xs text-white outline-none focus:border-white transition-all placeholder:text-white/20 disabled:opacity-40"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-4">
                        <span className="text-[9px] font-mono font-bold text-white/20">
                            {inputText.length}/{chatLimit}
                        </span>
                        <button 
                            type="submit"
                            disabled={!inputText.trim() || sending || !isConnected}
                            className="text-white/40 hover:text-white transition-all"
                        >
                            {sending ? '...' : 'SEND'}
                        </button>
                    </div>
                </div>
            </form>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
