'use client';

import { useState, useRef, useEffect } from 'react';
import { useCommunityChat } from '@/hooks/useCommunityChat';
import { useWallet } from '@/context/WalletContext';

export default function CommunityChat() {
    const { messages, loading, sending, sendMessage, chatLimit } = useCommunityChat();
    const { accountId, isConnected } = useWallet();
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
        <div className="frosted p-10 flex flex-col h-[550px] rounded-[3rem] relative overflow-hidden group">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-6">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-neon-blue"></div>
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">Protocol Sync</h3>
                </div>
                <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20 px-4 py-1 rounded-full">
                    Ledger Active
                </div>
            </div>

            {/* MESSAGE LIST */}
            <div 
                ref={scrollRef}
                className="flex-grow space-y-10 overflow-y-auto pr-4 custom-scrollbar mb-10"
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em] animate-pulse">Syncing History...</div>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => {
                        const isMe = accountId && msg.sender === accountId;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-fade-in`}>
                                <div className="flex items-center space-x-4 mb-3">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">
                                        {isMe ? 'Local Node' : msg.sender}
                                    </span>
                                    <span className="text-[9px] text-white/10 font-mono">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`p-5 frosted max-w-[90%] text-[12px] leading-relaxed relative ${
                                    isMe 
                                    ? 'border-blue-500/30 text-white' 
                                    : 'border-white/10 text-white/60'
                                }`}>
                                    {isMe && <div className="absolute top-0 right-0 w-20 h-full bg-blue-500/5 -z-10"></div>}
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <p className="text-[10px] text-white font-bold uppercase tracking-widest">No Active Discourse</p>
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
                        placeholder="Broadcast message..."
                        maxLength={chatLimit}
                        className="w-full bg-white/5 border border-white/10 px-8 py-5 text-xs text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center space-x-6">
                        <span className="text-[10px] font-mono font-bold text-white/20">
                            {inputText.length}/{chatLimit}
                        </span>
                        <button 
                            type="submit"
                            disabled={!inputText.trim() || sending || !isConnected}
                            className="text-blue-500 font-black text-[10px] hover:text-white transition-all uppercase tracking-widest"
                        >
                            {sending ? '...' : 'Push'}
                        </button>
                    </div>
                </div>
            </form>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.2);
                }
            `}</style>
        </div>
    );
}
