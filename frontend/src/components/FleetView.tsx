'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Vehicle } from '@/store/useStore';
import { Search, Plus, X, Check, Activity, Trash2, Shield, HeartPulse, AlertTriangle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function FleetView() {
    const { vehicles, addVehicle, deleteVehicle, setVehicles, shipments } = useStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVehicle, setNewVehicle] = useState<any>({
        id: '', type: 'Truck (Heavy)', model: '',
        vin: '', plate_number: '', manufacture_year: 2024,
        fuel_type: 'DIESEL', payload_capacity_kg: 10000,
        last_service_date: new Date().toISOString().split('T')[0],
        insurance_policy: ''
    });
    const [success, setSuccess] = useState(false);
    const [filter, setFilter] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        axios.get(`${API}/api/vehicles`).then(res => setVehicles(res.data.vehicles)).catch(() => { });
    }, [setVehicles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const vehicle: Vehicle = { ...newVehicle, status: 'ACTIVE' };
        try {
            await axios.post(`${API}/api/vehicles`, vehicle);
            addVehicle(vehicle);
        } catch { addVehicle(vehicle); }
        setSuccess(true);
        setNewVehicle({ id: '', type: 'Truck (Heavy)', model: '', vin: '', plate_number: '', manufacture_year: 2024, fuel_type: 'DIESEL', payload_capacity_kg: 10000, last_service_date: new Date().toISOString().split('T')[0], insurance_policy: '' });
        setTimeout(() => { setSuccess(false); setShowAddModal(false); }, 1400);
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        try { await axios.delete(`${API}/api/vehicles/${id}`); } catch (_) { }
        deleteVehicle(id);
    };

    const filtered = vehicles.filter(v =>
        v.id.toLowerCase().includes(filter.toLowerCase()) ||
        v.type.toLowerCase().includes(filter.toLowerCase())
    );

    const Field = ({ label, children }: any) => (
        <div>
            <label className="block text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
            {children}
        </div>
    );

    const inputClass = "w-full rounded-lg px-3 py-2.5 text-[11px] font-medium transition-all outline-none";
    const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' };

    return (
        <div className="flex flex-col h-full slide-in gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gradient">Asset Registry</h2>
                    <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Fleet Management & Predictive Maintenance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text" placeholder="Search fleet..." value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-medium w-52 outline-none transition-all"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all"
                        style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', color: 'white', boxShadow: '0 4px 20px rgba(108,99,255,0.35)' }}>
                        <Plus size={14} /> Register Asset
                    </motion.button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden rounded-2xl flex flex-col"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)' }}>
                <div className="grid grid-cols-12 px-6 py-4 border-b" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-card)' }}>
                    {['Asset UID', 'Type', 'Model', 'Health Index', 'Status', ''].map((h, i) => (
                        <div key={i} className={`${[2, 2, 2, 2, 3, 1][i]} col-span-${[2, 2, 2, 2, 3, 1][i]} text-[9px] font-bold uppercase tracking-[0.2em]`}
                            style={{ color: 'var(--text-muted)', gridColumn: `span ${[2, 2, 2, 2, 3, 1][i]}` }}>
                            {h}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    <AnimatePresence initial={false}>
                        {filtered.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
                                <div className="p-6 rounded-2xl" style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)' }}>
                                    <Shield size={36} style={{ color: '#6c63ff', opacity: 0.4 }} />
                                </div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    {vehicles.length === 0 ? 'No Assets Registered' : 'No Results Found'}
                                </p>
                            </div>
                        ) : filtered.map((v) => {
                            const health = shipments[v.id]?.ai_analysis?.health_index ?? 100;
                            const isCrit = health < 70;
                            const healthColor = health < 60 ? '#ff3d6e' : health < 80 ? '#ff8b3d' : '#00e5a0';
                            return (
                                <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="grid grid-cols-12 px-6 py-4 hover:bg-white/5 transition-all items-center group gap-2">
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00e5a0' }} />
                                            <span className="text-[11px] font-bold">{v.id}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{v.type}</div>
                                    <div className="col-span-2 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{v.model || '—'}</div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${health}%` }}
                                                    className="h-full rounded-full" style={{ background: healthColor }}
                                                    transition={{ duration: 1, ease: 'easeOut' }} />
                                            </div>
                                            <span className="text-[10px] font-bold tabular-nums w-8" style={{ color: healthColor }}>{health}%</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold ${isCrit ? 'badge-danger' : 'badge-active'}`}>
                                            {isCrit ? <AlertTriangle size={9} /> : <Activity size={9} />}
                                            {isCrit ? 'MAINTENANCE' : 'NOMINAL'}
                                        </span>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button onClick={() => handleDelete(v.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                                            style={{ color: '#ff3d6e' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Registration Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0" style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(12px)' }} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-xl relative z-10 rounded-2xl p-8"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

                            <button onClick={() => setShowAddModal(false)}
                                className="absolute top-5 right-5 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                style={{ color: 'var(--text-muted)' }}>
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 rounded-xl" style={{ background: 'rgba(108,99,255,0.12)' }}>
                                    <Cpu size={18} style={{ color: '#6c63ff' }} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gradient">Asset Registration</h3>
                                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Deploy new node to the neural grid</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Asset UID *">
                                        <input required value={newVehicle.id}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value.toUpperCase() })}
                                            placeholder="TITAN_01" className={inputClass} style={inputStyle} />
                                    </Field>
                                    <Field label="VIN_ID *">
                                        <input required value={newVehicle.vin}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value.toUpperCase() })}
                                            placeholder="1A9C8B...452" className={inputClass} style={inputStyle} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Field label="Plate No *">
                                        <input required value={newVehicle.plate_number}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, plate_number: e.target.value.toUpperCase() })}
                                            placeholder="MH12AB88" className={inputClass} style={inputStyle} />
                                    </Field>
                                    <Field label="Fuel Type">
                                        <select value={newVehicle.fuel_type}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, fuel_type: e.target.value })}
                                            className={inputClass} style={inputStyle}>
                                            {['DIESEL', 'ELECTRIC', 'PETROL', 'HYBRID'].map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Capacity (KG)">
                                        <input type="number" value={newVehicle.payload_capacity_kg}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, payload_capacity_kg: parseInt(e.target.value) })}
                                            className={inputClass} style={inputStyle} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Asset Type">
                                        <select value={newVehicle.type}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                                            className={inputClass} style={inputStyle}>
                                            {['Truck (Heavy)', 'Truck (Medium)', 'Bus (Inter-city)', 'Bus (Charter)', 'Light Cargo', 'Freight Carrier', 'Specialized'].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Model Reference">
                                        <input value={newVehicle.model}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value.toUpperCase() })}
                                            placeholder="SCANIA_R450" className={inputClass} style={inputStyle} />
                                    </Field>
                                </div>

                                <Field label="Insurance Policy">
                                    <input value={newVehicle.insurance_policy}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, insurance_policy: e.target.value.toUpperCase() })}
                                        placeholder="POL_88219-ZZ" className={inputClass} style={inputStyle} />
                                </Field>

                                <motion.button type="submit" disabled={success || submitting}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                    className="w-full py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 mt-2 transition-all"
                                    style={success ? {
                                        background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.35)', color: '#00e5a0'
                                    } : {
                                        background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                                        color: 'white',
                                        boxShadow: '0 4px 30px rgba(108,99,255,0.4)'
                                    }}>
                                    {success ? <><Check size={14} /> Deployed to Grid</> :
                                        submitting ? <><Activity size={14} className="animate-spin" /> Committing...</> :
                                            <><Cpu size={14} /> Commit Asset to Grid</>}
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
