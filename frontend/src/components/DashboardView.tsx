'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });
import AlertPanel from './AlertPanel';
import CopilotPanel from './CopilotPanel';
import { useStore } from '@/store/useStore';
import { Globe, Box, Activity, RotateCcw, Check, HeartPulse, Brain, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function DashboardView() {
    const { shipments, vehicles, networkState, networkStats } = useStore();
    const activeShipments = Object.values(shipments);
    const [rerouting, setRerouting] = useState(false);
    const [rerouteResult, setRerouteResult] = useState<string | null>(null);

    const totalRisk = activeShipments.length > 0
        ? (activeShipments.reduce((acc, s: any) => acc + s.ai_analysis.risk_score, 0) / activeShipments.length).toFixed(1)
        : '0.0';

    const avgHealth = activeShipments.length > 0
        ? Math.round(activeShipments.reduce((acc, s: any) => acc + (s.ai_analysis.health_index || 100), 0) / activeShipments.length)
        : 100;

    const nodeCount = networkStats?.node_count ?? networkState?.nodes?.length ?? 0;

    const handleReroute = async () => {
        if (activeShipments.length < 1) return;
        setRerouting(true);
        setRerouteResult(null);
        try {
            const first: any = activeShipments[0];
            const res = await axios.post(`${API}/api/optimize-route`, {
                start_node: first.location,
                end_node: first.location === 'Mumbai_Hub' ? 'Delhi_Hub' : 'Mumbai_Hub',
            });
            if (res.data.status === 'success') {
                setRerouteResult(`Optimal: ${res.data.optimized_path.join(' → ')}`);
            } else {
                setRerouteResult('Route computation failed');
            }
        } catch {
            setRerouteResult('Backend unreachable');
        } finally {
            setRerouting(false);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-full slide-in">
            {/* Left: Map + Stats */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                    <StatCard label="Network Nodes" value={nodeCount.toString()} icon={<Globe size={16} />} color="#6c63ff" />
                    <StatCard label="Live Assets" value={vehicles.length.toString()} icon={<Box size={16} />} color="#00d4ff" />
                    <StatCard label="Fleet Health" value={`${avgHealth}%`} icon={<HeartPulse size={16} />}
                        color={avgHealth < 80 ? '#ff8b3d' : '#00e5a0'} highlight={avgHealth < 80} />
                    <StatCard label="Grid Risk Index" value={totalRisk} icon={<Activity size={16} />}
                        color={parseFloat(totalRisk) > 7 ? '#ff3d6e' : '#6c63ff'} highlight={parseFloat(totalRisk) > 7} />
                </div>

                {/* Map */}
                <div className="flex-1 min-h-[420px] rounded-2xl overflow-hidden relative"
                    style={{ border: '1px solid var(--border-dim)' }}>
                    <LiveMap />

                    <div className="absolute top-4 left-4 z-[999] pointer-events-none">
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                            style={{ background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(108,99,255,0.35)', backdropFilter: 'blur(10px)' }}>
                            <Brain size={14} style={{ color: '#6c63ff' }} className="animate-pulse" />
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: '#e8e8ff' }}>
                                Neural GeoTracking
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-ping" />
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 z-[999] pointer-events-none">
                        <div className="rounded-xl p-4 min-w-[200px]"
                            style={{ background: 'rgba(13,13,26,0.95)', border: '1px solid var(--border-dim)', backdropFilter: 'blur(10px)' }}>
                            <p className="text-[8px] font-black tracking-[0.4em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Grid Topology</p>
                            <div className="space-y-2">
                                <Row label="Active Links" value={activeShipments.length.toString()} />
                                <Row label="Avg Latency" value="2.4ms" />
                                <Row label="Status" value={parseFloat(totalRisk) > 5 ? 'CRITICAL' : 'NOMINAL'} highlight={parseFloat(totalRisk) > 5} />
                                <Row label="Neural Drift" value="0.02%" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Copilot */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                <div className="flex-1 rounded-2xl overflow-hidden"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>
                    <CopilotPanel />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReroute}
                    disabled={rerouting}
                    className="w-full py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-40 transition-all"
                    style={{
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.15))',
                        border: '1px solid rgba(108,99,255,0.4)',
                        color: '#6c63ff',
                    }}
                >
                    {rerouting ? <RotateCcw size={14} className="animate-spin" /> : <Zap size={14} />}
                    Authorize Neural Reroute
                </motion.button>

                {rerouteResult && (
                    <div className="px-4 py-3 rounded-lg text-center text-[9px] font-bold tracking-widest uppercase"
                        style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                        {rerouteResult}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, highlight = false }: any) {
    return (
        <motion.div whileHover={{ y: -2 }}
            className="rounded-2xl p-5 flex flex-col gap-3 cursor-default transition-all"
            style={{
                background: highlight
                    ? `linear-gradient(135deg, rgba(${hexToRgb(color)}, 0.1), rgba(${hexToRgb(color)}, 0.05))`
                    : 'var(--bg-surface)',
                border: highlight ? `1px solid rgba(${hexToRgb(color)}, 0.4)` : '1px solid var(--border-dim)',
                boxShadow: highlight ? `0 0 30px rgba(${hexToRgb(color)}, 0.1)` : 'none'
            }}>
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <div className="p-2 rounded-lg" style={{ background: `rgba(${hexToRgb(color)}, 0.12)`, color }}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-black tabular-nums" style={{ color: highlight ? color : 'var(--text-primary)' }}>
                {value}
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp size={10} />
                <span className="text-[9px] font-semibold">Live</span>
            </div>
        </motion.div>
    );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between text-[10px]">
            <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="font-bold tabular-nums" style={{ color: highlight ? '#ff3d6e' : 'var(--text-secondary)' }}>{value}</span>
        </div>
    );
}

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}
