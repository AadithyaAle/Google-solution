'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const login = useStore((state) => state.login);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && company) {
            login(email, company);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-white selection:text-black">
            <div className="absolute inset-0 bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex p-4 border border-white/20 mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-black tracking-[0.5em] uppercase mb-2">ZenitH CorE</h1>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Enterprise Orchestration Terminal</p>
                </div>

                <div className="border border-white/10 p-10 bg-black">
                    <h2 className="text-xs font-black tracking-[0.3em] uppercase mb-8 border-b border-white/10 pb-4">
                        {isRegistering ? 'Company Registration' : 'Terminal Access'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Administrator Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 text-xs font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none"
                                placeholder="0xUSER@ZENITH.IO"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Company Identifier</label>
                            <input
                                type="text"
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-3 text-xs font-bold tracking-widest focus:outline-none focus:border-white transition-all outline-none"
                                placeholder="GLOBAL_LOGISTICS_GRP"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all flex items-center justify-center gap-3 group"
                        >
                            {isRegistering ? 'Register Entity' : 'Establish Link'}
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/5">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-[9px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                        >
                            {isRegistering ? 'Return to Portal Access' : 'Inbound? Register New Company'}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Polaris Security Protocol V4.2</p>
                </div>
            </motion.div>
        </div>
    );
}
