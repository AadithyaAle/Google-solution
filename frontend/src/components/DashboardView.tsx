'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false });
import CopilotPanel from './CopilotPanel';
import { useStore } from '@/store/useStore';
import { Globe, Box, Activity, RotateCcw, Check, HeartPulse, Brain, Zap, TrendingUp, Cpu } from 'lucide-react';
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
                setRerouteResult(`Optimal Path: ${res.data.optimized_path.join(' → ')}`);
            } else {
                setRerouteResult('Route computation failed');
            }
        } catch {
            setRerouteResult('Neural Backend Offline');
        } finally {
            setRerouting(false);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-8 h-full animate-slide-up">
            {/* Left: Intelligence Analytics */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
                {/* Elite Stats Hub */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <IntelligenceCard label="Network Nodes" value={networkStats?.node_count || 0} icon={<Globe size={18} />} color="#0ea5e9" trend="+2.4%" />
                    <IntelligenceCard label="Fleet Assets" value={vehicles.length} icon={<Box size={18} />} color="#8b5cf6" trend="Live" />
                    <IntelligenceCard label="Global Health" value={`${avgHealth}%`} icon={<HeartPulse size={18} />} color={avgHealth < 80 ? '#f43f5e' : '#10b981'} trend="Nominal" />
                    <IntelligenceCard label="Neural Risk" value={totalRisk} icon={<Activity size={18} />} color={parseFloat(totalRisk) > 7 ? '#f43f5e' : '#f59e0b'} trend="Stable" />
                </div>

                {/* Geospatial Neural Grid */}
                <div className="flex-1 min-h-[500px] rounded-3xl overflow-hidden glass-card relative group border border-white/5">
                    <LiveMap />

                    <div className="absolute top-6 left-6 z-[999] pointer-events-none">
                        <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-[#0a0c14]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
                            <Cpu size={16} className="text-[#8b5cf6] animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white font-brand">JKY Neural Tracker</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Multi-Path Encryption Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 z-[999] pointer-events-none space-y-3">
                        <div className="px-5 py-4 rounded-2xl bg-[#0a0c14]/90 border border-white/10 backdrop-blur-xl min-w-[220px] shadow-2xl">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Grid Link Status</p>
                            <div className="space-y-3">
                                <GridRow label="Active Links" value={activeShipments.length} />
                                <GridRow label="Avg Latency" value="12.4ms" color="#10b981" />
                                <GridRow label="Neural Drift" value="0.002%" />
                                <GridRow label="Sync State" value="ENCRYPTED" color="#0ea5e9" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Neural Copilot Interface */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
                <div className="flex-1 rounded-3xl overflow-hidden glass-card border border-white/5 flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <Brain size={20} className="text-[#8b5cf6]" />
                            <h3 className="text-sm font-black font-brand uppercase tracking-widest">Neural Copilot</h3>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                            Online
                        </div>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        <CopilotPanel />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReroute}
                        disabled={rerouting}
                        className="w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl relative overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white' }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

                        {rerouting ? <RotateCcw size={16} className="animate-spin" /> : <Zap size={16} />}
                        Authorize Neural Reroute
                    </motion.button>

                    {rerouteResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center text-[10px] font-bold text-violet-400 uppercase tracking-widest"
                        >
                            {rerouteResult}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

function IntelligenceCard({ label, value, icon, color, trend }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="p-6 rounded-3xl glass-card flex flex-col gap-4 cursor-pointer hover-glow group transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl transition-colors group-hover:bg-white/5" style={{ background: `${color}15`, color }}>
                    {icon}
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded bg-white/5 text-slate-500">{trend}</span>
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                <h4 className="text-3xl font-black tabular-nums tracking-tighter brand-font">{value}</h4>
            </div>
        </motion.div>
    );
}

function GridRow({ label, value, color }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-[10px] font-black tabular-nums" style={{ color: color || 'var(--text-main)' }}>{value}</span>
        </div>
    );
}
