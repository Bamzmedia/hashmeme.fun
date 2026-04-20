'use client';

import { useState, useRef, useEffect } from 'react';
import { useCommunityChat } from '@/hooks/useCommunityChat';
import { useHederaAccount } from '@/hooks/useHederaAccount';

export default function CommunityChat() {
    const { messages, loading, sending, sendMessage, chatLimit } = useCommunityChat();
    const { accountId, isConnected } = useHederaAccount();
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
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
            alert(e.message || "Failed to send message over HCS");
        }
    };

    return (
        <div className="bg-black/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-[450px] shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-1000"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">HCS Community Chat</h3>
                </div>
                <span className="flex items-center space-x-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-emerald-500 font-black uppercase">Live on Testnet</span>
                </span>
            </div>

            {/* MESSAGE LIST */}
            <div 
                ref={scrollRef}
                className="flex-grow space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent custom-scrollbar mb-4 relative z-10"
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] animate-pulse">Fetching Consensus History...</div>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => {
                        const isMe = accountId && msg.sender === accountId;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-fade-in`}>
                                <div className="flex items-center space-x-2 mb-1.5">
                                    <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">
                                        {isMe ? 'You' : (msg.sender === '0.0.unknown' ? 'Unknown' : msg.sender)}
                                    </span>
                                    {!isMe && <span className="w-1 h-1 rounded-full bg-gray-800"></span>}
                                    <span className="text-[8px] text-gray-700 font-mono">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-medium border shadow-sm ${
                                    isMe 
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-100 rounded-tr-none' 
                                    : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                        <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-700 mb-4 flex items-center justify-center">
                            <span className="text-gray-700 text-xl font-black">?</span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center px-10">Start the conversation on HCS</p>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <form onSubmit={handleSend} className="mt-auto pt-4 border-t border-white/5 relative z-10">
                <div className="relative">
                    <input 
                        type="text"
                        value={inputText}
                        disabled={!isConnected || sending}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isConnected ? "Message community..." : "Connect wallet to chat"}
                        maxLength={chatLimit}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-xs text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-700 disabled:opacity-50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-3">
                        <span className={`text-[9px] font-mono font-bold ${inputText.length >= chatLimit ? 'text-pink-500' : 'text-gray-700'}`}>
                            {inputText.length}/{chatLimit}
                        </span>
                        <button 
                            type="submit"
                            disabled={!inputText.trim() || sending || !isConnected}
                            className={`p-2 rounded-xl transition-all ${
                                sending || !inputText.trim() || !isConnected
                                ? 'text-gray-700' 
                                : 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300'
                            }`}
                        >
                            {sending ? (
                                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            )}
                        </button>
                    </div>
                </div>
            </form>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
            `}</style>
        </div>
    );
}
