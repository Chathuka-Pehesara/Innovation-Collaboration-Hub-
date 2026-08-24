/* eslint-disable */
import { Request, Response } from 'express';
import { PrismaClient, ThreatType, ThreatSeverity } from '@prisma/client';

const prisma = new PrismaClient();

export const getThreatLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.threatLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100, // fetch the latest 100 logs
        });

        res.json({ logs });
    } catch (error) {
        console.error('Error fetching threat logs:', error);
        res.status(500).json({ error: 'Failed to fetch threat logs' });
    }
};

// Seed random threat logs for the demonstration dashboard
export const seedThreats = async (req: Request, res: Response) => {
    try {
        const ips = ['192.168.1.5', '10.0.0.9', '45.33.22.11', '8.8.8.8', '172.16.0.4', '140.23.4.1', '80.0.2.1'];
        const types: ThreatType[] = [
            ThreatType.HONEYPOT,
            ThreatType.BRUTE_FORCE,
            ThreatType.INVALID_POW,
            ThreatType.SQL_INJECTION_ATTEMPT
        ];
        const severities: ThreatSeverity[] = [
            ThreatSeverity.LOW,
            ThreatSeverity.MEDIUM,
            ThreatSeverity.HIGH,
            ThreatSeverity.CRITICAL
        ];

        const newThreats = [];
        for (let i = 0; i < 5; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const ip = ips[Math.floor(Math.random() * ips.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];

            let metadata = { browser: 'Chrome', os: 'Windows', coordinates: [Math.random() * 180 - 90, Math.random() * 360 - 180] };

            newThreats.push({
                ip,
                type,
                severity,
                fingerprint: 'fp_' + Math.random().toString(36).substr(2, 9),
                metadata: JSON.stringify(metadata)
            });
        }

        await prisma.threatLog.createMany({ data: newThreats });

        res.json({ message: 'Seeded 5 new simulated threats successfully', threats: newThreats });
    } catch (error) {
        console.error('Error seeding threats:', error);
        res.status(500).json({ error: 'Failed to seed threats' });
    }
};
