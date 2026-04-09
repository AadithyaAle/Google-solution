'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Brain, Send, Cpu, Activity, ShieldCheck, AlertCircle, Zap, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function CopilotPanel() {
    const { copilotMessages, addCopilotMessage, vehicles, shipments, networkStats } = useStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [copilotMessages, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'USER' as const,
            content: input.trim(),
            timestamp: new Date().toISOString()
        };
        addCopilotMessage(userMsg);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post(`${API}/api/copilot`, {
                query: userMsg.content,
                context: {
                    fleet_size: vehicles.length,
                    active_shipments: Object.keys(shipments).length,
                    avg_risk: networkStats?.avg_risk || 0
                }
            }, { timeout: 10000 });

            addCopilotMessage({
                id: (Date.now() + 1).toString(),
                role: 'COPILOT',
                content: res.data.message,
                timestamp: new Date().toISOString(),
                sentiment: res.data.sentiment
            });
        } catch (err) {
            addCopilotMessage({
                id: (Date.now() + 1).toString(),
                role: 'COPILOT',
                content: "CRITICAL ERROR: Neural Synchronization Failed.\n\nTechnical Details: I cannot establish a stable link with the JKY AI Core node. Please ensure the backend server is operational and your OpenAI credentials are valid in the system configuration.",
                timestamp: new Date().toISOString(),
                sentiment: 'ALERT'
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Message Stream */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                {copilotMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-6 py-12 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-2xl">
                            <Zap size={32} className="text-violet-500 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-black font-brand uppercase tracking-widest text-slate-200">JKY Node Online</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-[200px] leading-relaxed">
                                Standing by for orchestration commands or system queries.
                            </p>
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {copilotMessages.map((msg) => {
                        const isUser = msg.role === 'USER';
                        const isError = msg.sentiment === 'ALERT';
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-2 group">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                        {msg.role} // {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <div className={`max-w-[92%] rounded-2xl px-5 py-4 text-[12px] leading-relaxed border relative group ${isUser
                                    ? 'bg-violet-600/10 border-violet-600/30 text-slate-100 rounded-br-none'
                                    : isError
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-100 rounded-bl-none'
                                        : 'bg-slate-900/60 border-white/5 text-slate-300 rounded-bl-none'
                                    } shadow-xl`}>
                                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>

                                    {!isUser && msg.sentiment === 'SUCCESS' && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/10">
                                            <ShieldCheck size={12} className="text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Operation Verified</span>
                                        </div>
                                    )}
                                    {!isUser && isError && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-rose-500/10">
                                            <AlertCircle size={12} className="text-rose-500" />
                                            <span className="text-[9px] font-black text-rose-500/80 uppercase tracking-widest">Protocol Failure</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                        <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-1 h-1 rounded-full bg-violet-400"
                                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Computing Grid State...</span>
                    </motion.div>
                )}
            </div>

            {/* Terminal Input */}
            <div className="p-6 bg-white/[0.01] border-t border-white/5">
                <form onSubmit={handleSend} className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-500 transition-colors">
                        <Terminal size={16} />
                    </div>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Neural Command Input..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-14 pr-16 text-sm font-medium transition-all focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 placeholder:text-slate-600"
                    />
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        type="submit"
                        disabled={isTyping}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg transform transition-all hover:bg-violet-500 disabled:opacity-50"
                    >
                        <Send size={18} />
                    </motion.button>
                </form>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest px-1">Ready for Instruction</span>
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest px-1">JKY v4.2.0</span>
                </div>
            </div>
        </div>
    );
}
