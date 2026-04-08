'use client';

import React from 'react';
import { Shield, Truck, AlertTriangle, LayoutDashboard, Database, Bell, Search, User, LogOut, Cpu } from 'lucide-react';
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
        <div className="min-h-screen bg-black text-white flex font-sans selection:bg-white selection:text-black overflow-hidden h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-white/10 flex flex-col z-50 overflow-y-auto shrink-0">
                <div className="p-10 pb-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="p-3 bg-white w-fit">
                            <Shield className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black tracking-tighter uppercase whitespace-nowrap leading-none">
                                ZENITH OS
                            </h2>
                            <p className="text-[8px] font-black text-white/20 tracking-[0.4em] uppercase mt-2">Enterprise Edition</p>
                        </div>
                    </motion.div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavItem
                        icon={<LayoutDashboard size={14} />}
                        label="DASHBOARD"
                        active={currentTab === 'DASHBOARD'}
                        onClick={() => onTabChange?.('DASHBOARD')}
                    />
                    <NavItem
                        icon={<Truck size={14} />}
                        label="ACTIVE FLEET"
                        active={currentTab === 'ACTIVE FLEET'}
                        onClick={() => onTabChange?.('ACTIVE FLEET')}
                    />
                    <NavItem
                        icon={<AlertTriangle size={14} />}
                        label="RISK MONITORING"
                        active={currentTab === 'RISK MONITORING'}
                        onClick={() => onTabChange?.('RISK MONITORING')}
                    />

                    <div className="pt-10 pb-4 px-4">
                        <div className="h-px bg-white/10 w-8" />
                    </div>

                    <NavItem
                        icon={<Cpu size={14} />}
                        label="ORCHESTRATION"
                        active={currentTab === 'ORCHESTRATION'}
                        onClick={() => onTabChange?.('ORCHESTRATION')}
                    />
                    <NavItem
                        icon={<Bell size={14} />}
                        label="NOTIFICATIONS"
                        active={currentTab === 'NOTIFICATIONS'}
                        onClick={() => onTabChange?.('NOTIFICATIONS')}
                    />
                </nav>

                <div className="p-6">
                    <div className="p-6 border border-white/10 bg-white/5 mb-4 group hover:border-white/30 transition-all cursor-crosshair">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 group-hover:text-white/40">Registered Entity</p>
                        <p className="text-[11px] font-black truncate tracking-tighter">{companyName?.toUpperCase() || 'EXTERNAL_NODE'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 py-4 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all active:scale-95"
                    >
                        <LogOut size={12} />
                        Detach Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-10 z-40 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 w-3.5 h-3.5 group-hover:text-white/40 transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH_GRID_INDEX..."
                                className="bg-transparent border border-white/10 rounded-none py-2 pl-10 pr-6 text-[10px] font-bold tracking-[0.1em] focus:outline-none focus:border-white/30 w-72 transition-all uppercase placeholder:opacity-20 placeholder:font-black"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20 border-r border-white/10 pr-8">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-none shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            Kernel::Stable
                        </div>
                        <button className="flex items-center gap-3 p-1.5 border border-white/10 hover:border-white transition-all text-[10px] font-black uppercase tracking-widest px-6 group">
                            <User size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                            <span className="group-hover:tracking-[0.2em] transition-all">Super_Admin</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-black p-12 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 relative border group ${active
                    ? 'bg-white text-black border-white font-black z-10 shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
                    : 'text-white/30 border-transparent hover:text-white hover:border-white/10'
                }`}
        >
            <span className={active ? '' : 'opacity-40 group-hover:opacity-100 transition-all'}>
                {icon}
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{label}</span>
            {active && <div className="absolute right-0 w-[4px] h-full bg-black/10" />}
        </button>
    );
}
