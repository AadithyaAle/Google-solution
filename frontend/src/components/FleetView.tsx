'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Truck, Search, Filter, Plus, X, Check, MoreHorizontal, Bus, Shield, Activity, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FleetView() {
    const { vehicles, addVehicle } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ id: '', type: 'Truck (Heavy)', model: '' });
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addVehicle({ ...newVehicle, status: 'ACTIVE' });
        setSuccess(true);
        setNewVehicle({ id: '', type: 'Truck (Heavy)', model: '' });
        setTimeout(() => {
            setSuccess(false);
            setShowAddModal(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-black slide-in relative">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Asset Registry</h2>
                    <p className="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase mt-2">Fleet Management & Synchronization</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/40 transition-colors" size={12} />
                        <input
                            type="text"
                            placeholder="SEARCH_REGISTRY..."
                            className="bg-transparent border border-white/10 pl-10 pr-6 py-2.5 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white/40 transition-all outline-none w-64 uppercase"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-3 px-6 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all"
                    >
                        <Plus size={14} />
                        Register Asset
                    </button>
                </div>
            </div>

            <div className="border border-white/10 bg-black flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 px-8 py-4">
                    <div className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Asset_UID</div>
                    <div className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Classification</div>
                    <div className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Reference_Model</div>
                    <div className="col-span-2 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Link_Status</div>
                    <div className="col-span-1 text-right text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Arch</div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                    <AnimatePresence>
                        {vehicles.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-20 opacity-20">
                                <Shield size={48} className="mb-4" />
                                <p className="text-[10px] font-black tracking-[0.5em] uppercase">No Assets Registered in Grid</p>
                            </div>
                        ) : (
                            vehicles.map((v) => (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-12 px-8 py-6 hover:bg-white/5 transition-colors group items-center"
                                >
                                    <div className="col-span-3 text-[11px] font-black tracking-widest">{v.id}</div>
                                    <div className="col-span-3 text-[10px] font-bold text-white/40 uppercase tracking-tight">{v.type}</div>
                                    <div className="col-span-3 text-[10px] font-bold text-white/40 uppercase tracking-tight">{v.model}</div>
                                    <div className="col-span-2">
                                        <span className="inline-flex items-center gap-2 border border-white/20 px-2 py-0.5 text-[8px] font-black tracking-widest">
                                            <div className="w-1 h-1 bg-white animate-pulse" />
                                            SYNCHRONIZED
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button className="text-white/10 hover:text-white transition-colors">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add Asset Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg bg-black border border-white/10 relative z-10 p-12 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-10">
                                <h3 className="text-sm font-black tracking-[0.4em] uppercase mb-1">Asset Registration</h3>
                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Deploy new node to Grid</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Asset UID</label>
                                    <input
                                        required
                                        autoFocus
                                        value={newVehicle.id}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 p-4 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none uppercase"
                                        placeholder="0xASSET_ID"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="relative">
                                            <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Classification</label>
                                            <div className="relative group/select">
                                                <select
                                                    value={newVehicle.type}
                                                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 p-4 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none appearance-none cursor-pointer uppercase pr-10"
                                                >
                                                    <option value="Truck (Heavy)" className="bg-black text-white">TRUCK (HEAVY)</option>
                                                    <option value="Truck (Medium)" className="bg-black text-white">TRUCK (MEDIUM)</option>
                                                    <option value="Bus (Inter-city)" className="bg-black text-white">BUS (INTER-CITY)</option>
                                                    <option value="Bus (Freight)" className="bg-black text-white">BUS (FREIGHT)</option>
                                                    <option value="Light Cargo" className="bg-black text-white">LIGHT CARGO</option>
                                                    <option value="Specialized" className="bg-black text-white">SPECIALIZED</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                                    <CornerDownRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-white/20 mb-3">Model Ref</label>
                                        <input
                                            required
                                            value={newVehicle.model}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none uppercase"
                                            placeholder="VOLVO_X_SERIES"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={success}
                                    className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 ${success ? 'bg-white text-black' : 'bg-white text-black hover:invert transition-all active:scale-95'
                                        }`}
                                >
                                    {success ? (
                                        <>
                                            <Check size={14} />
                                            DEPLOYED
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={14} />
                                            COMMIT TO GRID
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
