'use client';

import React from 'react';
import { Shield, Truck, AlertTriangle, LayoutDashboard, Bell, LogOut, Cpu, Activity, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface Props {
    children: React.ReactNode;
    onTabChange?: (tab: string) => void;
    currentTab?: string;
}

export default function DashboardLayout({ children, onTabChange, currentTab }: Props) {
    const { logout, companyName } = useStore();

    return (
        <div className="min-h-screen flex font-sans overflow-hidden h-screen bg-black text-white">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col z-50 shrink-0 border-r border-white/5 bg-[#0a0c14]">
                {/* Branding: JKY AI */}
                <div className="p-8 pb-10">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight font-brand uppercase text-white">JKY AI</h2>
                                <p className="text-[9px] font-bold tracking-[0.25em] text-slate-500 uppercase">Neural Intelligence</p>
                            </div>
                        </div>

                        {/* Status Pulse */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Core Status: Stable</span>
                        </div>
                    </motion.div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase mb-4 px-4">Operations</p>
                    <NavItem icon={<LayoutDashboard size={18} />} label="Command Hub" active={currentTab === 'DASHBOARD'} onClick={() => onTabChange?.('DASHBOARD')} />
                    <NavItem icon={<Truck size={18} />} label="Fleet Nodes" active={currentTab === 'ACTIVE FLEET'} onClick={() => onTabChange?.('ACTIVE FLEET')} />
                    <NavItem icon={<AlertTriangle size={18} />} label="Neural Risk" active={currentTab === 'RISK MONITORING'} onClick={() => onTabChange?.('RISK MONITORING')} />

                    <div className="pt-8 pb-4 px-4">
                        <div className="h-px w-full bg-slate-800/50" />
                    </div>

                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase mb-4 px-4">Orchestration</p>
                    <NavItem icon={<Cpu size={18} />} label="Automations" active={currentTab === 'ORCHESTRATION'} onClick={() => onTabChange?.('ORCHESTRATION')} />
                    <NavItem icon={<Bell size={18} />} label="Alert Stream" active={currentTab === 'NOTIFICATIONS'} onClick={() => onTabChange?.('NOTIFICATIONS')} />
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 mt-auto">
                    <div className="rounded-2xl p-4 mb-4 bg-slate-900/40 border border-white/5 backdrop-blur-sm group hover:border-violet-500/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-500/10 text-violet-400 font-bold border border-violet-500/20">
                                {useStore.getState().userEmail?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[11px] font-black truncate text-slate-200">
                                    {useStore.getState().userEmail?.split('@')[0].toUpperCase() || 'OPERATOR'}
                                </p>
                                <p className="text-[9px] text-slate-500 font-medium">Global Administrator</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 group"
                    >
                        <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Detach Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#07080f]">
                {/* HeaderBar */}
                <header className="h-20 flex items-center justify-between px-10 shrink-0 border-b border-white/5 bg-[#0a0c14]/80 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <Activity size={16} className="text-violet-500" />
                        <span className="text-sm font-bold tracking-tight text-slate-300 capitalize">
                            {currentTab?.toLowerCase() || 'dashboard'}
                        </span>
                        <ChevronRight size={14} className="text-slate-700" />
                        <span className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">
                            JKY AI Node // Alpha-01
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mr-8">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-violet-500/40 shadow-[0_0_10px_rgba(124,58,237,0.4)]" />
                                Sys::Uptime 99.9%
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500/40 shadow-[0_0_10px_rgba(14,165,233,0.4)]" />
                                Latency::12ms
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400">
                            <Shield size={14} className="text-violet-400" />
                            Neural_Security_Active
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <div className="flex-1 overflow-auto p-10 custom-scrollbar relative">
                    {/* Subtle Scanline Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-4 transition-all duration-300 relative group rounded-xl border ${active
                ? 'bg-violet-500/10 border-violet-500/30 text-white shadow-[0_0_20px_rgba(124,58,237,0.1)]'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/5 hover:bg-white/5'
                }`}
        >
            <span className={`transition-transform duration-300 ${active ? 'text-violet-400 scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </span>
            <span className="text-[12px] font-bold tracking-tight whitespace-nowrap">{label}</span>
            {active && (
                <motion.div
                    layoutId="nav-active"
                    className="absolute left-0 w-[4px] h-6 bg-violet-500 rounded-full"
                />
            )}
        </motion.button>
    );
}
