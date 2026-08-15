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
        <div className="min-h-screen p-6 relative overflow-hidden font-mono z-0 mt-16 rounded-2xl border" style={{ backgroundColor: '#07090b', color: '#ffffff', borderColor: '#10b981' }}>
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.05) 1px,transparent 1px)", backgroundSize: '40px 40px' }} />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: '#34d399' }}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1.9-2 2-2m-2 2v5m0-5a2 2 0 00-2-2m10 2a8 8 0 11-16 0 8 8 0 0116 0z" />
                        </svg>
                        SOC Threat Intelligence
                    </h1>
                    <p className="mt-2 uppercase text-xs tracking-widest font-bold" style={{ color: '#6ee7b7' }}>Live System Monitoring & Threat Detection</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide border transition-all flex items-center gap-2"
                        style={{
                            backgroundColor: isLive ? 'rgba(16,185,129,0.2)' : '#111827',
                            borderColor: isLive ? '#10b981' : '#374151',
                            color: isLive ? '#6ee7b7' : '#9ca3af',
                            boxShadow: isLive ? '0 0 15px rgba(16,185,129,0.3)' : 'none'
                        }}
                    >
                        {isLive ? (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#6ee7b7' }}></span>
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
                        style={{ backgroundColor: 'rgba(239,68,68,0.2)', borderColor: '#ef4444', color: '#fca5a5', boxShadow: '0 0 15px rgba(239,68,68,0.3)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Simulate Attack
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

                <div className="col-span-1 lg:col-span-2 border rounded-2xl p-6 relative overflow-hidden shadow-2xl" style={{ backgroundColor: '#0a0d14', borderColor: '#0f3a2b' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.05))' }} />

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-semibold tracking-widest text-xs uppercase" style={{ color: '#34d399' }}>Global Attack Vectors</h2>
                        <div className="text-[10px] uppercase tracking-widest" style={{ color: '#6ee7b7' }}>Sys_Status: Valid</div>
                    </div>

                    <div className="relative w-full h-[400px] flex items-center justify-center">
                        {/* The Radar Sweep Effect - Fixed Overflow and Positioning */}
                        <div className="absolute w-[300px] h-[300px] rounded-full border z-10 overflow-hidden" style={{ borderColor: 'rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="w-[200px] h-[200px] rounded-full border z-20" style={{ borderColor: 'rgba(16,185,129,0.4)', position: 'absolute' }}></div>
                            <div className="w-[100px] h-[100px] rounded-full border flex items-center justify-center z-20" style={{ borderColor: 'rgba(16,185,129,0.6)', position: 'absolute' }}>
                                <div className="w-2 h-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,1)]" style={{ backgroundColor: '#10b981' }} />
                            </div>

                            <motion.div
                                className="absolute top-0 left-0 w-[150px] h-[150px] origin-bottom-right"
                                style={{
                                    backgroundImage: 'conic-gradient(from 180deg at 100% 100%, rgba(16,185,129,0) 0deg, rgba(16,185,129,0.4) 90deg)',
                                    borderRight: '2px solid rgba(52, 211, 153, 0.8)'
                                }}
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

                <div className="col-span-1 border rounded-2xl p-6 relative flex flex-col h-[500px]" style={{ backgroundColor: '#0a0d14', borderColor: '#0f3a2b' }}>
                    <h2 className="font-semibold tracking-widest text-xs uppercase mb-4 sticky top-0 pb-2 z-10 border-b" style={{ color: '#34d399', backgroundColor: '#0a0d14', borderColor: '#0f3a2b' }}>
                        Real-Time Intercept Logs
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-track-transparent" style={{ overflowY: 'auto' }}>
                        {logs.length === 0 ? (
                            <div className="text-center text-xs mt-10 uppercase font-bold" style={{ color: '#6ee7b7' }}>Awaiting Events...</div>
                        ) : null}
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-3 border rounded-xl transition-colors"
                                    style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase"
                                            style={{
                                                color: log.severity === 'CRITICAL' ? '#fca5a5' : log.severity === 'HIGH' ? '#fdba74' : '#6ee7b7',
                                                borderColor: log.severity === 'CRITICAL' ? 'rgba(239,68,68,0.5)' : log.severity === 'HIGH' ? 'rgba(249,115,22,0.5)' : 'rgba(16,185,129,0.5)',
                                                backgroundColor: log.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : log.severity === 'HIGH' ? 'rgba(249,115,22,0.2)' : 'rgba(16,185,129,0.2)'
                                            }}
                                        >
                                            {log.severity}
                                        </span>
                                        <span className="text-[10px]" style={{ color: '#6ee7b7' }}>
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold mt-1 uppercase tracking-tight" style={{ color: '#ffffff' }}>{log.type.replace(/_/g, ' ')}</p>
                                    <div className="flex justify-between items-end mt-2 opacity-80">
                                        <span className="text-[10px]" style={{ color: '#e5e7eb' }}>SRC: {log.ip || 'Unknown'}</span>
                                        <span className="text-[9px]" style={{ color: '#6ee7b7' }}>FP: {log.fingerprint?.slice(0, 8)}...</span>
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
