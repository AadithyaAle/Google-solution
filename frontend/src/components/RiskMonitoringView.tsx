'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { ShieldAlert, Zap, Clock, Activity, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RiskMonitoringView() {
    const alerts = useStore((state) => state.alerts);

    return (
        <div className="flex flex-col h-full bg-black slide-in">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-xl font-black tracking-tighter uppercase">Risk Monitoring</h2>
                    <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase mt-1">AI-Driven Disruption Triage</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 border border-white/10 px-4 py-2 bg-white/5">
                        <Activity size={12} className="text-white/40" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Scanning Network</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-10 flex-1 overflow-hidden">
                {/* Alerts Feed */}
                <div className="col-span-12 lg:col-span-7 flex flex-col overflow-hidden border border-white/10">
                    <div className="bg-white/5 border-b border-white/10 p-4">
                        <h3 className="text-[10px] font-black tracking-[0.2em] uppercase">Active Neural Alerts</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {alerts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-20 opacity-20 grayscale">
                                    <Zap size={48} className="mb-6" />
                                    <p className="text-[10px] font-black tracking-[0.5em] uppercase">No Critical Hazards Detected</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-8 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 border border-white/20">
                                                    <ShieldAlert size={20} className={alert.ai_analysis.risk_score > 7 ? 'text-white' : 'text-white/40'} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black tracking-widest uppercase">{alert.shipment_id}</h4>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{alert.location}</span>
                                                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={10} className="text-white/20" />
                                                            <span className="text-[9px] font-bold text-white/30 uppercase">Just Now</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black tabular-nums tracking-tighter">{alert.ai_analysis.risk_score.toFixed(1)}</div>
                                                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Severity Index</div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 p-6">
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4">Neural Mitigation Steps</p>
                                            <div className="space-y-3">
                                                {alert.ai_analysis.mitigation_plan.map((step, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <CornerDownRight size={12} className="text-white/20 mt-0.5" />
                                                        <p className="text-[10px] text-white/70 font-medium uppercase tracking-tight leading-relaxed">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Global Statistics */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-10">
                    <div className="border border-white/10 p-10 bg-black">
                        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase mb-8 border-b border-white/10 pb-4">Hazard Statistics</h3>
                        <div className="space-y-8">
                            <StatItem label="Total Disruptions" value={alerts.length.toString()} />
                            <StatItem label="Average Severity" value={alerts.length > 0 ? (alerts.reduce((acc, a) => acc + a.ai_analysis.risk_score, 0) / alerts.length).toFixed(2) : "0.00"} />
                            <StatItem label="Active Protocols" value={alerts.length > 0 ? "7" : "0"} />
                        </div>
                    </div>

                    <div className="border border-white/10 p-10 bg-white/5">
                        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase mb-6">AI Status</h3>
                        <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">
                            GPT-4o engine is monitoring all transit nodes. Next system scan in 0.8s. All protocols initialized and standing by for rerouting authorization.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-end justify-between border-b border-white/5 pb-4 last:border-0 hover:border-white/20 transition-all group">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors">{label}</span>
            <span className="text-xl font-black tracking-tighter">{value}</span>
        </div>
    );
}
