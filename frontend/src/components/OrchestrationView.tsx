'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Cpu, Server, Network, Terminal, Share2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrchestrationView() {
    const { companyName } = useStore();

    return (
        <div className="flex flex-col h-full bg-black slide-in">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Neural Orchestration</h2>
                    <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2">Core System Architecture & Link Topology</p>
                </div>
                <div className="px-5 py-2 border border-white/10 text-[9px] font-black tracking-widest uppercase text-white/40">
                    Node_Kernel // v4.0.2-LST
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10 flex-1">
                {/* Topology Diagram Simulation */}
                <div className="col-span-12 lg:col-span-8 border border-white/10 bg-black relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:40px_40px] opacity-10" />

                    <div className="relative flex flex-col items-center">
                        {/* Mock Central Node */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-24 h-24 border-2 border-white flex items-center justify-center relative z-10"
                        >
                            <Cpu size={32} />
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest whitespace-nowrap">ZENITH_CORE</div>
                        </motion.div>

                        {/* Mock Connections */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />

                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                            <div
                                key={deg}
                                className="absolute top-1/2 left-1/2 w-[300px] h-px bg-gradient-to-r from-white/20 to-transparent origin-left"
                                style={{ transform: `rotate(${deg}deg)` }}
                            />
                        ))}
                    </div>

                    <div className="absolute bottom-8 right-8 text-right">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] mb-2">Neural Handshake Status</p>
                        <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase">STABLE // 0ms Latency</p>
                    </div>
                </div>

                {/* Technical Logs */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-10">
                    <div className="border border-white/10 p-10 bg-white/5 flex-1">
                        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                            <Terminal size={14} /> System_Logs
                        </h3>
                        <div className="space-y-4 font-mono text-[9px] leading-relaxed text-white/40">
                            <p><span className="text-white/60">[04:06:12]</span> AUTH_ENTITY::{companyName?.toUpperCase()}</p>
                            <p><span className="text-white/60">[04:06:22]</span> SYNCING_NODES::INITIATED</p>
                            <p><span className="text-white/60">[04:06:24]</span> GPT4o_ORCHESTRATOR::READY</p>
                            <p><span className="text-white/60">[04:06:33]</span> LINK_PROTOCOL_V4::ESTABLISHED</p>
                            <p className="animate-pulse">_</p>
                        </div>
                    </div>

                    <div className="border border-white/10 p-10 bg-black">
                        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase mb-6">Component Integrity</h3>
                        <div className="space-y-6">
                            <LogStatus label="Telemetry_Bus" status="OK" />
                            <LogStatus label="Risk_Engine" status="POLLING" />
                            <LogStatus label="DB_Handshake" status="ACTIVE" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogStatus({ label, status }: { label: string; status: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
            <span className="text-[9px] font-black tracking-widest border border-white/10 px-2 py-0.5">{status}</span>
        </div>
    );
}
