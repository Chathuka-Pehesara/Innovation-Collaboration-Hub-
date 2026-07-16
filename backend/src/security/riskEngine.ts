/**
 * @file        riskEngine.ts
 * @owner       Cybersecurity Team
 * @description Calculates a Risk Score (0-100) based on device fingerprint, IP,
 *              browser, OS, and login time vs. prior known successful logins.
 *              Decision: >=70 → Allow, <70 → Block
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RiskInput {
    userId: string;
    fingerprint: string;
    ip: string;
    browser: string;
    os: string;
    loginTime?: Date;
}

export interface RiskResult {
    score: number;
    decision: 'ALLOW' | 'REVIEW' | 'BLOCK';
    reasons: string[];
}

/**
 * Evaluate risk for a given login attempt.
 * Compares current device against past SUCCESSFUL login activities.
 * Returns score 0-100 (higher = more trustworthy).
 */
export async function evaluateRisk(input: RiskInput): Promise<RiskResult> {
    const { userId, fingerprint, ip, browser, os, loginTime = new Date() } = input;
    let score = 0;
    const reasons: string[] = [];

    try {
        // Fetch past 30 days of successful logins
        const pastLogins = await prisma.loginActivity.findMany({
            where: {
                userId,
                status: 'SUCCESS',
                loginTime: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: { loginTime: 'desc' },
            take: 50,
        });

        if (pastLogins.length === 0) {
            // Very first login — moderate risk (new user trusts partially)
            score = 55;
            reasons.push('First known login — baseline score assigned');
        } else {
            const knownFingerprints = new Set(pastLogins.map((l) => l.fingerprint));
            const knownIPs = new Set(pastLogins.map((l) => l.ip));
            const knownBrowsers = new Set(pastLogins.map((l) => l.browser));
            const knownOSes = new Set(pastLogins.map((l) => l.os));

            // Rule 1: Trusted device fingerprint (+35)
            if (fingerprint !== 'none' && knownFingerprints.has(fingerprint)) {
                score += 35;
                reasons.push('Trusted device recognized (+35)');
            } else {
                reasons.push('New/unrecognized device fingerprint (+0)');
            }

            // Rule 2: Known IP (+20)
            if (knownIPs.has(ip)) {
                score += 20;
                reasons.push('Known IP address (+20)');
            } else {
                reasons.push('New IP address (+0)');
            }

            // Rule 3: Known browser (+20)
            if (knownBrowsers.has(browser)) {
                score += 20;
                reasons.push('Known browser (+20)');
            } else {
                reasons.push('New browser (+0)');
            }

            // Rule 4: Known OS (+15)
            if (knownOSes.has(os)) {
                score += 15;
                reasons.push('Known OS (+15)');
            } else {
                reasons.push('New OS (+0)');
            }

            // Rule 5: Login history bonus (+10)
            if (pastLogins.length >= 3) {
                score += 10;
                reasons.push('Established login history (+10)');
            }
        }
    } catch (err) {
        // On DB error, fail-open with moderate score to avoid blocking legitimate users
        console.error('[RISK ENGINE] Database query failed, using fallback score:', err);
        score = 65;
        reasons.push('Risk engine DB error — fallback score used');
    }

    // Clamp to 0-100
    score = Math.min(100, Math.max(0, score));

    let decision: RiskResult['decision'];
    if (score >= 70) {
        decision = 'ALLOW';
    } else if (score >= 50) {
        decision = 'REVIEW';
    } else {
        decision = 'BLOCK';
    }

    return { score, decision, reasons };
}
