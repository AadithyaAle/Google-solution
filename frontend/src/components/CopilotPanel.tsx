'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Brain, Send, Cpu, Activity, ShieldCheck, AlertCircle, Zap } from 'lucide-react';
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
            });

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
                content: 'ERROR: Neural link synchronization failed. Check backend connection.',
                timestamp: new Date().toISOString(),
                sentiment: 'ALERT'
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative"
            style={{ background: 'var(--bg-surface)' }}>

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b"
                style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-card)' }}>
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg" style={{ background: 'rgba(108,99,255,0.15)' }}>
                        <Brain size={14} style={{ color: '#6c63ff' }} />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>Neural Copilot</span>
                        <span className="text-[8px] font-medium ml-2 px-1.5 py-0.5 rounded" style={{ background: 'rgba(108,99,255,0.1)', color: '#6c63ff' }}>v4.0</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
                    <span className="text-[8px] font-bold tracking-widest uppercase" style={{ color: '#00e5a0' }}>Live</span>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {copilotMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                        <div className="p-5 rounded-2xl" style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
                            <Zap size={28} style={{ color: '#6c63ff' }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Neural Copilot Ready</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Ask about fleet health, risks, or route optimization</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {copilotMessages.map((msg) => {
                        const isUser = msg.role === 'USER';
                        const isCritical = msg.sentiment === 'ALERT';
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                    {isUser ? <Activity size={9} /> : <Cpu size={9} />}
                                    <span className="text-[8px] font-medium">
                                        {msg.role} · {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false })}
                                    </span>
                                </div>
                                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-[11px] leading-relaxed`}
                                    style={isUser ? {
                                        background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))',
                                        border: '1px solid rgba(108,99,255,0.3)',
                                        color: 'var(--text-primary)',
                                        borderBottomRightRadius: '4px'
                                    } : isCritical ? {
                                        background: 'rgba(255,61,110,0.08)',
                                        border: '1px solid rgba(255,61,110,0.3)',
                                        color: 'var(--text-primary)',
                                        borderBottomLeftRadius: '4px'
                                    } : {
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid var(--border-dim)',
                                        color: 'var(--text-secondary)',
                                        borderBottomLeftRadius: '4px'
                                    }}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    {!isUser && msg.sentiment === 'SUCCESS' && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <ShieldCheck size={10} style={{ color: '#00e5a0' }} />
                                            <span className="text-[9px]" style={{ color: '#00e5a0' }}>System Secure</span>
                                        </div>
                                    )}
                                    {!isUser && isCritical && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <AlertCircle size={10} style={{ color: '#ff3d6e' }} className="animate-pulse" />
                                            <span className="text-[9px]" style={{ color: '#ff3d6e' }}>Alert Active</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                        <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: '#6c63ff' }}
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                />
                            ))}
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Neural is thinking...</span>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-card)' }}>
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Neural Copilot..."
                        className="flex-1 rounded-xl px-4 py-3 text-[11px] font-medium transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-dim)',
                            color: 'var(--text-primary)',
                            outline: 'none'
                        }}
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-3 rounded-xl transition-all"
                        style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', color: 'white' }}
                    >
                        <Send size={15} />
                    </motion.button>
                </div>
            </form>
        </div>
    );
}
