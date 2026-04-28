'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Terminal, Cpu } from 'lucide-react';

interface LogEntry {
    time: string;
    message: string;
}

export default function OrchestrationView() {
    const { companyName, networkState, networkStats } = useStore();
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const ts = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

    // Grow live system log buffer
    useEffect(() => {
        const messages = [
            `AUTH_ENTITY::${(companyName || 'ENTITY').toUpperCase()}`,
            'SYNCING_NODES::INITIATED',
            'GPT4o_ORCHESTRATOR::READY',
            'LINK_PROTOCOL_V4::ESTABLISHED',
            'WEBSOCKET_STREAM::ACTIVE',
            'RISK_ENGINE::POLLING',
            'TELEMETRY_BUS::CONNECTED',
        ];
        const initial = messages.map((m) => ({ time: ts(), message: m }));
        setLogs(initial);

        const interval = setInterval(() => {
            const live_msgs = [
                'HEARTBEAT::ACK',
                'NODE_SCAN::COMPLETE',
                `RISK_BROADCAST::SCORE_${(Math.random() * 10).toFixed(2)}`,
                'ROUTE_OPTIMIZER::IDLE',
                'TELEMETRY_BATCH::INGESTED',
            ];
            setLogs((prev) => [
                { time: ts(), message: live_msgs[Math.floor(Math.random() * live_msgs.length)] },
                ...prev,
            ].slice(0, 18));
        }, 2500);

        return () => clearInterval(interval);
    }, [companyName]);

    const nodes = networkState?.nodes ?? [];
    const links = networkState?.links ?? [];

    return (
        <div className="flex flex-col h-full bg-black slide-in">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Neural Orchestration</h2>
                    <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2">
                        Core System Architecture & Live Topology
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="border border-white/10 px-5 py-2 text-[9px] font-black tracking-widest uppercase text-white/30">
                        Nodes: {networkStats?.node_count ?? nodes.length}
                    </div>
                    <div className="border border-white/10 px-5 py-2 text-[9px] font-black tracking-widest uppercase text-white/30">
                        Links: {networkStats?.link_count ?? links.length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10 flex-1 overflow-hidden">
                {/* Network Graph */}
                <div className="col-span-12 lg:col-span-7 border border-white/10 bg-black flex-1 overflow-y-auto custom-scrollbar p-8">
                    <h3 className="text-[9px] font-black tracking-[0.3em] uppercase mb-6 text-white/30 border-b border-white/10 pb-3">
                        Supply Chain Graph
                    </h3>

                    {links.length === 0 ? (
                        <div className="flex items-center justify-center h-40 opacity-20">
                            <Cpu size={32} />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {links.map((link: any, i: number) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3 border border-white/5 hover:border-white/20 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 shrink-0 ${link.status === 'CRITICAL' ? 'bg-white animate-pulse' :
                                                link.status === 'WARNING' ? 'bg-white/60' : 'bg-white/20'
                                            }`} />
                                        <span className="text-[9px] font-black tracking-widest uppercase">
                                            {link.source.replace('_', ' ')}
                                        </span>
                                        <span className="text-white/20 text-[8px]">→</span>
                                        <span className="text-[9px] font-black tracking-widest uppercase">
                                            {link.target.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-[9px] font-bold text-white/30 tabular-nums">
                                            W: {link.weight.toFixed(1)}
                                        </span>
                                        <span className={`text-[8px] font-black tracking-widest border px-2 py-0.5 ${link.status === 'CRITICAL' ? 'border-white text-white' :
                                                link.status === 'WARNING' ? 'border-white/40 text-white/60' :
                                                    'border-white/10 text-white/30'
                                            }`}>
                                            {link.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logs + Status */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-8 overflow-hidden">
                    <div className="border border-white/10 p-8 bg-black flex flex-col overflow-hidden flex-1">
                        <h3 className="text-[9px] font-black tracking-[0.3em] uppercase mb-6 border-b border-white/10 pb-3 flex items-center gap-3 shrink-0">
                            <Terminal size={12} className="text-white/40" /> System_Kernel_Logs
                        </h3>
                        <div className="overflow-y-auto custom-scrollbar space-y-3 flex-1">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4 font-mono text-[9px]">
                                    <span className="text-white/40 shrink-0">[{log.time}]</span>
                                    <span className="text-white/60 break-all">{log.message}</span>
                                </div>
                            ))}
                            <div className="text-white/30 animate-pulse font-mono text-[9px]">_</div>
                        </div>
                    </div>

                    <div className="border border-white/10 p-8 bg-white/5 shrink-0">
                        <h3 className="text-[9px] font-black tracking-[0.3em] uppercase mb-5">Component Integrity</h3>
                        <div className="space-y-4">
                            <LogStatus label="Telemetry_Bus" ok={true} />
                            <LogStatus label="Risk_Engine" ok={true} />
                            <LogStatus label="Vector_DB" ok={false} />
                            <LogStatus label="WS_Gateway" ok={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogStatus({ label, ok }: { label: string; ok: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
            <span className={`text-[8px] font-black tracking-widest border px-2 py-0.5 ${ok ? 'border-white/20 text-white' : 'border-white/5 text-white/20'}`}>
                {ok ? 'ACTIVE' : 'STANDBY'}
            </span>
        </div>
    );
}
