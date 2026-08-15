'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

type ThreatLog = {
    id: string;
    ip: string | null;
    type: string;
    severity: string;
    fingerprint: string | null;
    metadata: string | null;
    createdAt: string;
};

export default function SecurityDashboard() {
    const [logs, setLogs] = useState<ThreatLog[]>([]);
    const [isLive, setIsLive] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/security/logs');
            setLogs(res.data.logs);
        } catch (err) {
            console.error(err);
        }
    };

    const seedThreats = async () => {
        try {
            await api.post('/security/seed');
            fetchLogs();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLogs();
        let interval: NodeJS.Timeout;
        if (isLive) {
            interval = setInterval(fetchLogs, 3000); // Check for new threats every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isLive]);

    return (
        <div className="min-h-screen bg-[#07090b] text-[#ffffff] p-6 relative overflow-hidden font-mono z-0 mt-16 rounded-2xl border border-[#064e3b]/30">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#34d399] tracking-tight flex items-center gap-3">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1.9-2 2-2m-2 2v5m0-5a2 2 0 00-2-2m10 2a8 8 0 11-16 0 8 8 0 0116 0z" />
                        </svg>
                        SOC Threat Intelligence
                    </h1>
                    <p className="text-[#064e3b]/60 mt-1 uppercase text-xs tracking-widest font-bold">Live System Monitoring & Threat Detection</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide border transition-all flex items-center gap-2
              ${isLive ? 'bg-emerald-950/40 border-[#10b981]/50 text-[#34d399] shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                    >
                        {isLive ? (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                            </span>
                        ) : (
                            <span className="h-2 w-2 rounded-full bg-gray-500" />
                        )}
                        Live Feed {isLive ? 'ON' : 'OFF'}
                    </button>

                    <button
                        onClick={seedThreats}
                        className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide bg-red-950/30 border border-[#f87171]/30 text-[#f87171] hover:bg-red-900/50 hover:border-[#f87171]/60 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Simulate Attack
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

                {/* Real-time Threat Map / Radar */}
                <div className="col-span-1 lg:col-span-2 bg-[#0c0e12] border border-[#064e3b]/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/5 pointer-events-none" />

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[#10b981] font-semibold tracking-widest text-xs uppercase">Global Attack Vectors</h2>
                        <div className="text-[10px] text-[#064e3b]/40 uppercase tracking-widest">Sys_Status: Valid</div>
                    </div>

                    <div className="relative w-full h-[400px] flex items-center justify-center">
                        {/* The Radar Sweep Effect */}
                        <div className="absolute w-[300px] h-[300px] rounded-full border border-[#10b981]/10 flex items-center justify-center z-10">
                            <div className="w-[200px] h-[200px] rounded-full border border-[#10b981]/20 flex items-center justify-center">
                                <div className="w-[100px] h-[100px] rounded-full border border-[#10b981]/30 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_20px_rgba(16,185,129,1)]" />
                                </div>
                            </div>
                            <motion.div
                                className="absolute top-0 w-1/2 h-1/2 bg-gradient-to-br from-[#10b981]/0 to-[#10b981]/20 origin-bottom-right"
                                style={{ borderRight: '2px solid rgba(16, 185, 129, 0.5)' }}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            />
                        </div>

                        {/* Blips / Attacks */}
                        <AnimatePresence>
                            {logs.slice(0, 10).map((log, i) => {
                                // Random position just for visualization if coords aren't set
                                let top = '50%';
                                let left = '50%';
                                try {
                                    const meta = JSON.parse(log.metadata || '{}');
                                    if (meta.coordinates) {
                                        top = `${50 + (meta.coordinates[0] / 90) * 50}%`;
                                        left = `${50 + (meta.coordinates[1] / 180) * 50}%`;
                                    }
                                } catch (e) { }

                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.8, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute z-20 w-3 h-3 rounded-full"
                                        style={{
                                            top,
                                            left,
                                            backgroundColor: log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'HIGH' ? '#f97316' : '#10b981',
                                            boxShadow: `0 0 15px ${log.severity === 'CRITICAL' ? '#ef4444' : '#10b981'}`,
                                        }}
                                    >
                                        {/* Ring animation */}
                                        <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                                            style={{ backgroundColor: log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'HIGH' ? '#f97316' : '#10b981' }}>
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Live Attack Feed */}
                <div className="col-span-1 bg-[#0c0e12] border border-[#064e3b]/20 rounded-2xl p-6 relative flex flex-col h-[500px]">
                    <h2 className="text-[#10b981] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-0 bg-[#0c0e12] pb-2 z-10 border-b border-[#064e3b]/20">
                        Real-Time Intercept Logs
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-emerald-900/30 scrollbar-track-transparent">
                        {logs.length === 0 ? (
                            <div className="text-center text-[#064e3b]/40 text-xs mt-10 uppercase">Awaiting Events...</div>
                        ) : null}
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-3 bg-emerald-950/20 border border-[#064e3b]/30 rounded-xl hover:bg-emerald-900/20 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase
                      ${log.severity === 'CRITICAL' ? 'text-red-400 border-[#f87171]/30 bg-red-950/40' :
                                                log.severity === 'HIGH' ? 'text-orange-400 border-[#fb923c]/30 bg-orange-950/40' :
                                                    'text-[#34d399] border-[#10b981]/30 bg-emerald-950/40'}`}
                                        >
                                            {log.severity}
                                        </span>
                                        <span className="text-[10px] text-[#064e3b]/50">
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#ffffff] mt-1 uppercase tracking-tight">{log.type.replace(/_/g, ' ')}</p>
                                    <div className="flex justify-between items-end mt-2 opacity-60">
                                        <span className="text-[10px]">SRC: {log.ip || 'Unknown'}</span>
                                        <span className="text-[9px] text-[#10b981]/50">FP: {log.fingerprint?.slice(0, 8)}...</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

        </div>
    );
}
