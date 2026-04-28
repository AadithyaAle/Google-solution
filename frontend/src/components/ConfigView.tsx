'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Plus, Check } from 'lucide-react';

export default function ConfigView() {
    const addVehicle = useStore((state) => state.addVehicle);
    const [id, setId] = useState('');
    const [type, setType] = useState('Heavy Duty');
    const [model, setModel] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addVehicle({
            id,
            type,
            model,
            vin: `VIN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            plate_number: `PLT_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            manufacture_year: 2024,
            fuel_type: 'DIESEL',
            payload_capacity_kg: 10000,
            last_service_date: new Date().toISOString().split('T')[0],
            insurance_policy: 'PENDING_INIT',
            status: 'ACTIVE'
        });
        setSuccess(true);
        setId('');
        setModel('');
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="max-w-xl mx-auto py-10 slide-in">
            <div className="text-center mb-16">
                <h2 className="text-xl font-black tracking-tighter uppercase mb-2">Configuration</h2>
                <p className="text-[10px] font-bold text-white/30 tracking-widest uppercase">System Initialization & Asset Registration</p>
            </div>

            <div className="border border-white/10 p-10 bg-black">
                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
                    Register New Asset
                    {success && <span className="text-white flex items-center gap-1"><Check size={10} /> Added successfully</span>}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Asset UID</label>
                        <input
                            required
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none"
                            placeholder="TRUCK_XX99"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Classification</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none appearance-none cursor-pointer"
                        >
                            <option value="Truck (Heavy)">TRUCK (HEAVY)</option>
                            <option value="Truck (Medium)">TRUCK (MEDIUM)</option>
                            <option value="Bus (Inter-city)">BUS (INTER-CITY)</option>
                            <option value="Bus (Charter)">BUS (CHARTER)</option>
                            <option value="Freight Carrier">FREIGHT CARRIER</option>
                            <option value="Other Transport">OTHER TRANSPORT</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Manufacturer / Model Ref</label>
                        <input
                            required
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none"
                            placeholder="VOLVO FH16"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all flex items-center justify-center gap-3"
                    >
                        <Plus size={14} />
                        Commit Asset to GRID
                    </button>
                </form>
            </div>
        </div>
    );
}
