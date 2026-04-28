'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { ShieldAlert, Zap, Clock, ChevronRight, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertPanel() {
    const alerts = useStore((state) => state.alerts);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-xs font-black tracking-[.3em] uppercase">
                        Intelligence Stream
                    </h2>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[.1em] mt-1">Real-time Triage Logic</p>
                </div>
                <div className="flex items-center gap-2 border border-white/20 px-2 py-1">
                    <div className="w-1 h-1 bg-white animate-pulse" />
                    <span className="text-[8px] font-black tracking-widest">LIVE_FEED</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-px pr-2">
                <AnimatePresence initial={false}>
                    {alerts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                            <Zap className="text-white mb-4" size={24} />
                            <p className="text-[9px] font-bold uppercase tracking-widest">No active disruptions</p>
                        </div>
                    ) : (
                        alerts.map((alert, idx) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/5 p-4 py-6 last:border-0 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-white/40">
                                            <ShieldAlert size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest">
                                                {alert.shipment_id}
                                            </h4>
                                            <p className="text-[8px] text-white/30 font-bold uppercase mt-0.5 tracking-tight">{alert.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black border border-white/10 px-2">
                                        RISK::{alert.ai_analysis.risk_score.toFixed(1)}
                                    </div>
                                </div>

                                <div className="space-y-1.5 pl-6 border-l border-white/10">
                                    {alert.ai_analysis.mitigation_plan.map((step, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <CornerDownRight size={10} className="text-white/20 mt-0.5" />
                                            <p className="text-[9px] text-white/60 font-medium uppercase tracking-tight">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
