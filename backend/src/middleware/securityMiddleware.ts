/**
 * @file        securityMiddleware.ts
 * @owner       Cybersecurity Team
 * @description Extracts and normalizes device details (IP, browser, OS, fingerprint)
 *              from each incoming request. Attaches securityDetails to req.
 * @depends     None
 */

import { Request, Response, NextFunction } from 'express';

export interface SecurityDetails {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
    fingerprint: string;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            securityDetails?: SecurityDetails;
        }
    }
}

function parseBrowser(ua: string): string {
    if (!ua) return 'Unknown';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/') && !ua.includes('Chromium')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    if (ua.includes('MSIE') || ua.includes('Trident/')) return 'IE';
    if (ua.includes('Postman')) return 'Postman';
    return 'Other';
}

function parseOS(ua: string): string {
    if (!ua) return 'Unknown';
    if (ua.includes('Windows NT 10')) return 'Windows 10/11';
    if (ua.includes('Windows NT')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
}

function getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return (Array.isArray(forwarded) ? forwarded[0] : forwarded)
            .split(',')[0]
            .trim();
    }
    return req.socket?.remoteAddress || req.ip || '0.0.0.0';
}

/**
 * Middleware: attaches req.securityDetails for downstream handlers.
 * Safe to use on all routes — fingerprint defaults to 'none' if not in body.
 */
export const securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const ua = req.headers['user-agent'] || '';
    req.securityDetails = {
        ip: getClientIp(req),
        userAgent: ua,
        browser: parseBrowser(ua),
        os: parseOS(ua),
        fingerprint: req.body?.fingerprint || 'none',
    };
    next();
};
