/**
 * @file        healthController.ts
 * @owner       Networking Team
 * @description System health check controller. Pings all service dependencies
 *              and returns structured status for monitoring.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import axios from 'axios';
import os from 'os';

const prisma = new PrismaClient();

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number | null;
  message?: string;
}

interface HealthReport {
  overall: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptimeSeconds: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    aiService: ServiceStatus;
  };
  system: {
    platform: string;
    freeMemoryMB: number;
    totalMemoryMB: number;
    cpuCount: number;
    loadAverage: number[];
  };
}

// ─── Check PostgreSQL ────────────────────────────────────────────────────────
async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err: any) {
    return { status: 'down', latencyMs: null, message: err.message };
  }
}

// ─── Check Redis ─────────────────────────────────────────────────────────────
async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    await client.connect();
    await client.ping();
    await client.disconnect();
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (err: any) {
    return { status: 'down', latencyMs: null, message: err.message };
  }
}

// ─── Check AI Service ────────────────────────────────────────────────────────
async function checkAiService(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const url = `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/health`;
    const res = await axios.get(url, { timeout: 4000 });
    const latency = Date.now() - start;
    return {
      status: res.status === 200 ? 'healthy' : 'degraded',
      latencyMs: latency,
    };
  } catch (err: any) {
    return { status: 'down', latencyMs: null, message: err.message };
  }
}

// ─── Main Health Handler ─────────────────────────────────────────────────────
export const getHealth = async (req: Request, res: Response): Promise<void> => {
  const [database, redis, aiService] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkAiService(),
  ]);

  const statuses = [database.status, redis.status, aiService.status];
  const overall = statuses.includes('down')
    ? 'down'
    : statuses.includes('degraded')
    ? 'degraded'
    : 'healthy';

  const report: HealthReport = {
    overall,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: { database, redis, aiService },
    system: {
      platform: os.platform(),
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
    },
  };

  const httpStatus = overall === 'healthy' ? 200 : overall === 'degraded' ? 207 : 503;
  res.status(httpStatus).json(report);
};

// ─── Simple Liveness Probe (for Docker/K8s) ──────────────────────────────────
export const getLiveness = (_req: Request, res: Response): void => {
  res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
};
