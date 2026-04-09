'use client';

import React from 'react';
import { Shield, Truck, AlertTriangle, LayoutDashboard, Bell, LogOut, Cpu, Activity, ChevronRight } from 'lucide-react';
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
        <div className="min-h-screen text-[--text-primary] flex font-sans overflow-hidden h-screen"
            style={{ background: 'var(--bg-base)' }}>

            {/* Sidebar */}
            <aside className="w-64 flex flex-col z-50 shrink-0 border-r"
                style={{
                    background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-card) 100%)',
                    borderColor: 'var(--border-dim)'
                }}>

                {/* Logo */}
                <div className="p-8 pb-10">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-purple"
                                style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-black tracking-tight text-gradient">ZENITH OS</h2>
                                <p className="text-[9px] font-semibold tracking-[0.25em] uppercase" style={{ color: 'var(--text-muted)' }}>
                                    Enterprise Edition
                                </p>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)' }}>
                            <div className="w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
                            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#00e5a0' }}>
                                Kernel::Stable
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    <p className="text-[8px] font-black tracking-[0.35em] uppercase px-4 mb-3" style={{ color: 'var(--text-muted)' }}>
                        Command Center
                    </p>
                    <NavItem icon={<LayoutDashboard size={15} />} label="Dashboard" active={currentTab === 'DASHBOARD'} onClick={() => onTabChange?.('DASHBOARD')} />
                    <NavItem icon={<Truck size={15} />} label="Active Fleet" active={currentTab === 'ACTIVE FLEET'} onClick={() => onTabChange?.('ACTIVE FLEET')} />
                    <NavItem icon={<AlertTriangle size={15} />} label="Risk Monitoring" active={currentTab === 'RISK MONITORING'} onClick={() => onTabChange?.('RISK MONITORING')} />

                    <div className="pt-6 pb-3 px-4">
                        <div className="h-px w-full" style={{ background: 'var(--border-dim)' }} />
                    </div>
                    <p className="text-[8px] font-black tracking-[0.35em] uppercase px-4 mb-3" style={{ color: 'var(--text-muted)' }}>System</p>
                    <NavItem icon={<Cpu size={15} />} label="Orchestration" active={currentTab === 'ORCHESTRATION'} onClick={() => onTabChange?.('ORCHESTRATION')} />
                    <NavItem icon={<Bell size={15} />} label="Notifications" active={currentTab === 'NOTIFICATIONS'} onClick={() => onTabChange?.('NOTIFICATIONS')} />
                </nav>

                {/* User Card */}
                <div className="p-5">
                    <div className="rounded-xl p-4 mb-4 space-y-3"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white"
                                style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)' }}>
                                {companyName?.charAt(0)?.toUpperCase() || 'Z'}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold truncate">{companyName?.toUpperCase() || 'EXTERNAL_NODE'}</p>
                                <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Super Admin</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: 'rgba(255,61,110,0.08)', border: '1px solid rgba(255,61,110,0.25)', color: '#ff3d6e' }}
                    >
                        <LogOut size={12} />
                        Detach Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-10 shrink-0 border-b"
                    style={{ background: 'rgba(13,13,26,0.8)', borderColor: 'var(--border-dim)', backdropFilter: 'blur(20px)' }}>
                    <div className="flex items-center gap-3">
                        <Activity size={14} style={{ color: 'var(--accent-primary)' }} />
                        <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text-secondary)' }}>
                            {currentTab?.toLowerCase() || 'dashboard'}
                        </span>
                        <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                            Zenith OS
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase"
                            style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', color: '#6c63ff' }}>
                            {useStore.getState().userEmail?.split('@')[0] ?? 'OPERATOR'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8"
                    style={{ background: 'var(--bg-base)' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <motion.button
            whileHover={{ x: 2 }}
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group text-left"
            style={active ? {
                background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))',
                border: '1px solid rgba(108,99,255,0.4)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(108,99,255,0.15)'
            } : {
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--text-muted)'
            }}
        >
            <span style={active ? { color: '#6c63ff' } : {}}>
                {icon}
            </span>
            <span className="text-[11px] font-semibold tracking-wider">{label}</span>
            {active && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent-primary)', boxShadow: '0 0 6px var(--accent-primary)' }} />
            )}
        </motion.button>
    );
}
