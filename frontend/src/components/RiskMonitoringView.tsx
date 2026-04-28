'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { ShieldAlert, Zap, Clock, Activity, CornerDownRight, Brain, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RiskMonitoringView() {
    const alerts = useStore((state) => state.alerts);

    const avgSeverity = alerts.length > 0
        ? (alerts.reduce((acc, a) => acc + a.ai_analysis.risk_score, 0) / alerts.length).toFixed(2)
        : '0.00';
    const activeProtocols = new Set(alerts.map(a => a.location)).size;

    return (
        <div className="flex flex-col h-full slide-in gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #ff3d6e, #ff8b3d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Risk Monitoring
                    </h2>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>AI-Driven Disruption Triage Engine</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.25)' }}>
                    <Activity size={13} style={{ color: '#00e5a0' }} className="animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest" style={{ color: '#00e5a0' }}>SCANNING NETWORK</span>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Disruptions', value: alerts.length.toString(), color: '#ff3d6e', icon: <ShieldAlert size={14} /> },
                    { label: 'Avg Severity', value: avgSeverity, color: '#ff8b3d', icon: <Activity size={14} /> },
                    { label: 'Active Protocols', value: activeProtocols.toString(), color: '#6c63ff', icon: <Brain size={14} /> },
                ].map(s => (
                    <div key={s.label} className="rounded-xl p-5 flex items-center gap-4"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>
                        <div className="p-3 rounded-lg" style={{ background: `rgba(${hexToRgb(s.color)}, 0.1)`, color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Alerts Feed */}
                <div className="col-span-12 lg:col-span-7 flex flex-col overflow-hidden rounded-2xl"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>
                    <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-dim)' }}>
                        <ShieldAlert size={14} style={{ color: '#ff3d6e' }} />
                        <h3 className="text-sm font-bold">Active Neural Alerts</h3>
                        {alerts.length > 0 && (
                            <span className="ml-auto text-[9px] font-black px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(255,61,110,0.12)', border: '1px solid rgba(255,61,110,0.3)', color: '#ff3d6e' }}>
                                {alerts.length} ACTIVE
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y custom-scrollbar" style={{ borderColor: 'var(--border-subtle)' }}>
                        <AnimatePresence initial={false}>
                            {alerts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
                                    <div className="p-6 rounded-full" style={{ background: 'rgba(0,229,160,0.08)' }}>
                                        <CheckCircle size={40} style={{ color: '#00e5a0', opacity: 0.5 }} />
                                    </div>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>No Critical Hazards Detected</p>
                                    <p className="text-[10px]" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>All systems nominal</p>
                                </div>
                            ) : (
                                alerts.map((alert) => {
                                    const isCritical = alert.ai_analysis.risk_score > 7;
                                    const col = isCritical ? '#ff3d6e' : '#ff8b3d';
                                    return (
                                        <motion.div key={alert.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                            className="p-6 hover:bg-white/5 transition-colors">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-xl" style={{ background: `rgba(${hexToRgb(col)}, 0.1)`, color: col }}>
                                                        <ShieldAlert size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black tracking-tight">{alert.shipment_id}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>{alert.location}</span>
                                                            <Clock size={9} style={{ color: 'var(--text-muted)' }} />
                                                            <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
                                                                {new Date(alert.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black" style={{ color: col }}>
                                                        {alert.ai_analysis.risk_score.toFixed(1)}
                                                    </div>
                                                    <div className="text-[8px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                                        Severity
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dim)' }}>
                                                <p className="text-[8px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--text-muted)' }}>
                                                    Neural Mitigation Steps
                                                </p>
                                                <div className="space-y-2">
                                                    {alert.ai_analysis.mitigation_plan.map((step, i) => (
                                                        <div key={i} className="flex items-start gap-2.5">
                                                            <CornerDownRight size={11} style={{ color: '#6c63ff', marginTop: 2 }} />
                                                            <p className="text-[10px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                                {step}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* AI Status Panel */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                    <div className="rounded-2xl p-6 flex-1"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <Brain size={16} style={{ color: '#6c63ff' }} />
                            <h3 className="text-sm font-bold">AI Engine Status</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Model', value: 'GPT-4o Neural', color: '#6c63ff' },
                                { label: 'Scan Cycle', value: '0.8s / cycle', color: '#00d4ff' },
                                { label: 'Inference', value: 'ACTIVE', color: '#00e5a0' },
                                { label: 'Confidence', value: '97.4%', color: '#00e5a0' },
                                { label: 'Rerouting', value: 'ON STANDBY', color: '#ff8b3d' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                                    <span className="text-[11px] font-bold" style={{ color: item.color }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl p-5"
                        style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.06))', border: '1px solid rgba(108,99,255,0.25)' }}>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: '#6c63ff' }}>System Advisory</p>
                        <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            All transit nodes are being monitored. Predictive alerts are generated using real-time vibration and temperature telemetry. Neural rerouting is standing by.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}
