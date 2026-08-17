'use client';

import { useState, useEffect, useMemo } from 'react';
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

    const exportToCSV = () => {
        if (logs.length === 0) return;

        // Create CSV Headers
        const headers = ['Timestamp', 'Severity', 'Type', 'Source IP', 'Fingerprint', 'Raw Metadata'];

        // Map log array to CSV row format
        const csvRows = logs.map(log => {
            const date = new Date(log.createdAt).toISOString();
            return `"${date}","${log.severity}","${log.type}","${log.ip || 'Unknown'}","${log.fingerprint || 'N/A'}","${(log.metadata || '').replace(/"/g, '""')}"`;
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');

        // Trigger Browser Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SOC_Threat_Intelligence_Export_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchLogs();
        let interval: NodeJS.Timeout;
        if (isLive) {
            interval = setInterval(fetchLogs, 3000); // Check for new threats every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isLive]);

    // Compute strictly recent logs (within the last 10 minutes) to keep the dashboard clean
    const recentLogs = useMemo(() => {
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        return logs.filter(log => new Date(log.createdAt).getTime() > tenMinutesAgo);
    }, [logs]);

    return (
        <div className="min-h-screen p-6 relative overflow-hidden font-mono z-0 mt-16 rounded-2xl border" style={{ backgroundColor: '#07090b', color: '#ffffff', borderColor: '#10b981' }}>

            <style dangerouslySetInnerHTML={{
                __html: `
        .soc-override { color: #34d399 !important; }
        .soc-override-secondary { color: #6ee7b7 !important; }
        .soc-text-white { color: #ffffff !important; }
      `}} />

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.05) 1px,transparent 1px)", backgroundSize: '40px 40px' }} />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="text-3xl font-bold tracking-tight flex items-center gap-3 soc-override">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1.9-2 2-2m-2 2v5m0-5a2 2 0 00-2-2m10 2a8 8 0 11-16 0 8 8 0 0116 0z" />
                        </svg>
                        SOC Threat Intelligence
                    </div>
                    <p className="mt-2 text-xs tracking-widest font-bold soc-override-secondary uppercase">Live System Monitoring & Threat Detection</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide border transition-all flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)', color: '#93c5fd', boxShadow: '0 0 15px rgba(59,130,246,0.1)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Sheet
                    </button>

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

                <div className="col-span-1 lg:col-span-2 border rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col h-[500px]" style={{ backgroundColor: '#0a0d14', borderColor: '#0f3a2b' }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.05))' }} />

                    <div className="flex justify-between items-center mb-6">
                        <div className="font-semibold tracking-widest text-xs uppercase soc-override">Global Attack Vectors ({recentLogs.length} Active in last 10m)</div>
                        <div className="text-[10px] uppercase tracking-widest soc-override-secondary">Sys_Status: Valid</div>
                    </div>

                    <div className="relative w-full flex-1 flex items-center justify-center pointer-events-none group">
                        {/* The Radar Sweep Effect - Professional Full 360 Smooth */}
                        <div className="absolute w-[350px] h-[350px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                            <div className="absolute w-[350px] h-[350px] rounded-full border border-dashed opacity-30" style={{ borderColor: '#10b981' }}></div>
                            <div className="absolute w-[250px] h-[250px] rounded-full border opacity-40" style={{ borderColor: '#10b981' }}></div>
                            <div className="absolute w-[150px] h-[150px] rounded-full border opacity-50" style={{ borderColor: '#10b981' }}></div>
                            <div className="absolute w-[50px] h-[50px] rounded-full border flex items-center justify-center opacity-60" style={{ borderColor: '#10b981' }}>
                                <div className="w-2 h-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,1)]" style={{ backgroundColor: '#34d399' }} />
                            </div>

                            <div className="absolute w-full h-[1px] opacity-20" style={{ backgroundColor: '#10b981' }}></div>
                            <div className="absolute h-full w-[1px] opacity-20" style={{ backgroundColor: '#10b981' }}></div>

                            <motion.div
                                className="absolute inset-0 w-full h-full rounded-full"
                                style={{
                                    background: 'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0) 65%, rgba(16, 185, 129, 0.05) 85%, rgba(16, 185, 129, 0.4) 100%)',
                                    borderRight: '2px solid rgba(52, 211, 153, 0.8)'
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                            />

                            <AnimatePresence>
                                {recentLogs.slice(0, 15).map((log, i) => {
                                    let top = '50%';
                                    let left = '50%';

                                    const charCode = log.id.charCodeAt(0) + log.id.charCodeAt(8) + log.id.charCodeAt(15);
                                    const angle = (charCode * 137.5) * (Math.PI / 180);
                                    const radius = (charCode % 40) + 5;

                                    top = `${50 + (radius * Math.sin(angle))}%`;
                                    left = `${50 + (radius * Math.cos(angle))}%`;

                                    try {
                                        const meta = JSON.parse(log.metadata || '{}');
                                        if (meta.coordinates) {
                                            top = `${50 + (meta.coordinates[0] / 90) * 45}%`;
                                            left = `${50 + (meta.coordinates[1] / 180) * 45}%`;
                                        }
                                    } catch (e) { }

                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.8, 1] }}
                                            exit={{ scale: 0, opacity: 0, transition: { duration: 0.5 } }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: (Math.random() * 2) }}
                                            className="absolute z-20 w-3 h-3 rounded-full"
                                            style={{
                                                top,
                                                left,
                                                marginTop: '-6px',
                                                marginLeft: '-6px',
                                                backgroundColor: log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'HIGH' ? '#f97316' : '#10b981',
                                                boxShadow: `0 0 15px ${log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'HIGH' ? '#f97316' : '#10b981'}`,
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
                </div>

                <div className="col-span-1 border rounded-2xl p-6 relative flex flex-col h-[500px]" style={{ backgroundColor: '#0a0d14', borderColor: '#0f3a2b' }}>
                    <div className="font-semibold tracking-widest text-xs uppercase mb-4 sticky top-0 pb-2 z-10 border-b soc-override" style={{ backgroundColor: '#0a0d14', borderColor: '#0f3a2b' }}>
                        Real-Time Intercept Logs
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-track-transparent" style={{ overflowY: 'auto' }}>
                        {recentLogs.length === 0 ? (
                            <div className="text-center text-xs mt-10 uppercase font-bold soc-override-secondary">Clear Area.<br /><br />No threats detected in the last 10 minutes.</div>
                        ) : null}
                        <AnimatePresence>
                            {recentLogs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
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
                                        <span className="text-[10px] soc-override-secondary">
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold mt-1 uppercase tracking-tight soc-text-white">{log.type.replace(/_/g, ' ')}</p>
                                    <div className="flex justify-between items-end mt-2 opacity-80">
                                        <span className="text-[10px]" style={{ color: '#e5e7eb' }}>SRC: {log.ip || 'Unknown'}</span>
                                        <span className="text-[9px] soc-override-secondary">FP: {log.fingerprint?.slice(0, 8)}...</span>
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
