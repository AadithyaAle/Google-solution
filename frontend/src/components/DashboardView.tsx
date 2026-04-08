'use client';

import React from 'react';
import LiveMap from './LiveMap';
import AlertPanel from './AlertPanel';
import { useStore } from '@/store/useStore';
import { Globe, Box, Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardView() {
    const { shipments, vehicles } = useStore();
    const activeShipments = Object.values(shipments);

    const totalRisk = activeShipments.length > 0
        ? (activeShipments.reduce((acc, s: any) => acc + s.ai_analysis.risk_score, 0) / activeShipments.length).toFixed(1)
        : "0.0";

    return (
        <div className="grid grid-cols-12 gap-0 border border-white/10 h-full slide-in bg-black">
            <div className="col-span-12 lg:col-span-8 flex flex-col">
                <div className="grid grid-cols-4 border-b border-white/10 divide-x divide-white/10">
                    <StatCard label="Global Nodes" value="24" icon={<Globe size={14} />} />
                    <StatCard label="Active Assets" value={vehicles.length.toString()} icon={<Box size={14} />} />
                    <StatCard label="Network Delta" value="44%" icon={<Activity size={14} />} />
                    <StatCard label="Agg Risk" value={totalRisk} icon={<Info size={14} />} />
                </div>

                <div className="flex-1 min-h-[500px] relative">
                    <LiveMap />
                    <div className="absolute top-0 right-0 p-8">
                        <div className="bg-black/90 border border-white/10 p-6 min-w-[240px]">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[.5em] mb-4">Neural Overview</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-white/40 uppercase tracking-widest">Active Links</span>
                                    <span className="font-black tabular-nums">{activeShipments.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-bold text-white/40 uppercase tracking-widest">Triage Queue</span>
                                    <span className="font-black text-white tracking-widest">{parseFloat(totalRisk) > 5.0 ? "CRITICAL" : "NOMINAL"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-8 text-[9px] font-black tracking-[0.5em] text-white/10 uppercase">
                        POLARIS_GRID // SECTOR_07
                    </div>
                </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col border-l border-white/10">
                <div className="flex-1 overflow-hidden p-6">
                    <AlertPanel />
                </div>
                <div className="p-8 border-t border-white/10">
                    <button className="w-full py-5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all hover:border-white">
                        Authorize Neural Reroute
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="p-8 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-3 mb-4 opacity-30 group-hover:opacity-60 transition-opacity">
                {icon}
                <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-3xl font-black tabular-nums tracking-tighter">{value}</div>
        </div>
    );
}
