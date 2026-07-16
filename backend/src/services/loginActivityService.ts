/**
 * @file        loginActivityService.ts
 * @owner       Cybersecurity Team
 * @description Helper service that safely writes LoginActivity records.
 *              Uses a raw Prisma instance to avoid build-time type conflicts.
 * @depends     security/riskEngine.ts
 */

import { PrismaClient } from '@prisma/client';
import { SecurityDetails } from '../middleware/securityMiddleware';

const prisma = new PrismaClient();

export type LoginStatus = 'SUCCESS' | 'FAILED' | 'BLOCKED';

interface LogLoginParams {
    userId: string;
    security: SecurityDetails;
    riskScore: number;
    status: LoginStatus;
}

/**
 * Persists a LoginActivity record. Fire-and-forget — never throws.
 */
export function logLoginActivity(params: LogLoginParams): void {
    const { userId, security, riskScore, status } = params;
    prisma.$executeRaw`
    INSERT INTO "LoginActivity" 
      (id, "userId", fingerprint, ip, browser, os, "userAgent", "riskScore", status, "loginTime")
    VALUES 
      (gen_random_uuid(), ${userId}, ${security.fingerprint}, ${security.ip}, 
       ${security.browser}, ${security.os}, ${security.userAgent}, ${riskScore}, ${status}, NOW())
  `.catch((err: unknown) => {
        console.error('[SECURITY] Failed to record login activity:', err);
    });
}
