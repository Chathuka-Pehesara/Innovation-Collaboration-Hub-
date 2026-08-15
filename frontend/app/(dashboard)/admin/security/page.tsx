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
        <div className="min-h-screen p-6 relative overflow-hidden font-mono z-0 mt-16 rounded-2xl border" style={{ backgroundColor: '#07090b', color: '#ffffff', borderColor: '#064e3b' }}>
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.03) 1px,transparent 1px)", backgroundSize: '40px 40px' }} />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: '#34d399' }}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1.9-2 2-2m-2 2v5m0-5a2 2 0 00-2-2m10 2a8 8 0 11-16 0 8 8 0 0116 0z" />
                        </svg>
                        SOC Threat Intelligence
                    </h1>
                    <p className="mt-1 uppercase text-xs tracking-widest font-bold" style={{ color: '#064e3b' }}>Live System Monitoring & Threat Detection</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide border transition-all flex items-center gap-2"
                        style={{
                            backgroundColor: isLive ? 'rgba(6,78,59,0.4)' : '#111827',
                            borderColor: isLive ? '#10b981' : '#374151',
                            color: isLive ? '#34d399' : '#6b7280',
                            boxShadow: isLive ? '0 0 15px rgba(16,185,129,0.15)' : 'none'
                        }}
                    >
                        {isLive ? (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#34d399' }}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#10b981' }}></span>
                            </span>
                        ) : (
                            <span className="h-2 w-2 rounded-full bg-gray-500" />
                        )}
                        Live Feed {isLive ? 'ON' : 'OFF'}
                    </button>

                    <button
                        onClick={seedThreats}
                        className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide border transition-all flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(127,29,29,0.3)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171', boxShadow: '0 0 15px rgba(239,68,68,0.1)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Simulate Attack
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

                <div className="col-span-1 lg:col-span-2 border rounded-2xl p-6 relative overflow-hidden shadow-2xl" style={{ backgroundColor: '#0c0e12', borderColor: 'rgba(6,78,59,0.2)' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, transparent, rgba(6,78,59,0.05))' }} />

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-semibold tracking-widest text-xs uppercase" style={{ color: '#10b981' }}>Global Attack Vectors</h2>
                        <div className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(6,78,59,0.4)' }}>Sys_Status: Valid</div>
                    </div>

                    <div className="relative w-full h-[400px] flex items-center justify-center">
                        {/* The Radar Sweep Effect */}
                        <div className="absolute w-[300px] h-[300px] rounded-full border flex items-center justify-center z-10" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
                            <div className="w-[200px] h-[200px] rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                                <div className="w-[100px] h-[100px] rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,1)]" style={{ backgroundColor: '#10b981' }} />
                                </div>
                            </div>
                            <motion.div
                                className="absolute top-0 w-1/2 h-1/2 origin-bottom-right"
                                style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(16,185,129,0), rgba(16,185,129,0.2))', borderRight: '2px solid rgba(16, 185, 129, 0.5)' }}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            />
                        </div>

                        <AnimatePresence>
                            {logs.slice(0, 10).map((log, i) => {
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
                                        <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-75"
                                            style={{ backgroundColor: log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'HIGH' ? '#f97316' : '#10b981' }}>
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="col-span-1 border rounded-2xl p-6 relative flex flex-col h-[500px]" style={{ backgroundColor: '#0c0e12', borderColor: 'rgba(6,78,59,0.2)' }}>
                    <h2 className="font-semibold tracking-widest text-xs uppercase mb-4 sticky top-0 pb-2 z-10 border-b" style={{ color: '#10b981', backgroundColor: '#0c0e12', borderColor: 'rgba(6,78,59,0.2)' }}>
                        Real-Time Intercept Logs
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-track-transparent" style={{ overflowY: 'auto' }}>
                        {logs.length === 0 ? (
                            <div className="text-center text-xs mt-10 uppercase" style={{ color: 'rgba(6,78,59,0.4)' }}>Awaiting Events...</div>
                        ) : null}
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-3 border rounded-xl transition-colors"
                                    style={{ backgroundColor: 'rgba(6,78,59,0.2)', borderColor: 'rgba(6,78,59,0.3)' }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                                            style={{
                                                color: log.severity === 'CRITICAL' ? '#f87171' : log.severity === 'HIGH' ? '#fb923c' : '#34d399',
                                                borderColor: log.severity === 'CRITICAL' ? 'rgba(248,113,113,0.3)' : log.severity === 'HIGH' ? 'rgba(251,146,60,0.3)' : 'rgba(16,185,129,0.3)',
                                                backgroundColor: log.severity === 'CRITICAL' ? 'rgba(127,29,29,0.4)' : log.severity === 'HIGH' ? 'rgba(194,65,12,0.4)' : 'rgba(6,78,59,0.4)'
                                            }}
                                        >
                                            {log.severity}
                                        </span>
                                        <span className="text-[10px]" style={{ color: 'rgba(6,78,59,0.5)' }}>
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold mt-1 uppercase tracking-tight" style={{ color: '#ffffff' }}>{log.type.replace(/_/g, ' ')}</p>
                                    <div className="flex justify-between items-end mt-2 opacity-60">
                                        <span className="text-[10px]">SRC: {log.ip || 'Unknown'}</span>
                                        <span className="text-[9px]" style={{ color: 'rgba(16,185,129,0.5)' }}>FP: {log.fingerprint?.slice(0, 8)}...</span>
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
