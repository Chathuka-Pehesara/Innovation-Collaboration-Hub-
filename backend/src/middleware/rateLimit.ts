/**
 * @file        rateLimit.ts
 * @owner       Cybersecurity Team
 * @description Flood prevention rules with dynamic tracking, SOC logging, and progressive escalation.
 * @depends     services/cacheService.ts, prismaClient
 */

import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../services/cacheService';
import prisma from '../prismaClient';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix: string;
}

export const rateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, message, keyPrefix } = options;
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!redisClient.isReady) {
        console.warn(`[RATE LIMIT] Redis not connected. Bypassing "${keyPrefix}".`);
        return next();
      }

      // Track by combination of IP and Email (if applicable) to avoid blanket-blocking safe IPs
      const ip = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString();
      const identifier = req.body?.email ? `${ip}:${req.body.email}` : ip;
      const key = `${keyPrefix}:${identifier}`;

      // Increment count and get TTL atomically
      const results = await redisClient.multi().incr(key).ttl(key).exec();

      if (!results || results.length < 2) {
        throw new Error('Redis transaction returned invalid result');
      }

      // The raw redis results format can sometimes be an array of errors/results.
      const incResult = results[0];
      const count = (Array.isArray(incResult) ? incResult[1] : incResult) as number;

      const ttlResult = results[1];
      let ttl = (Array.isArray(ttlResult) ? ttlResult[1] : ttlResult) as number;

      if (ttl === -1 || count === 1) {
        await redisClient.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      const remaining = Math.max(0, max - count);
      const resetTime = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      if (count > max) {
        // Evaluate attack severity: High abuse if they pass the limit by more than 3x multiplier
        const isSevere = count >= (max * 3);
        const severity = isSevere ? 'HIGH' : 'MEDIUM';

        // Fire SOC Security Event
        prisma.threatLog.create({
          data: {
            ip,
            type: 'RATE_LIMIT_EXCEEDED',
            severity,
            fingerprint: req.body?.email ? 'email_target' : 'ip_flood',
            metadata: JSON.stringify({
              endpoint: req.originalUrl,
              method: req.method,
              keyPrefix,
              attempts: count,
              allowed: max,
              actionTaken: 'HTTP 429 TEMP_BLOCK'
            }),
          }
        }).catch((e: any) => console.error('[ThreatLog] Rate Limit Log Failed', e));

        // If severe abuse, extend the ban penalty automatically (Progressive Delay)
        if (isSevere) {
          await redisClient.expire(key, windowSeconds * 2); // Double the penalty time footprint
        }

        return res.status(429).json({
          error: true,
          message: message || 'Too many requests. Please try again later.',
          statusCode: 429,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    } catch (error) {
      console.error(`[RATE LIMIT] Error executing rate limiting for prefix "${keyPrefix}":`, error);
      next();
    }
  };
};

// Use Environment Variables for Configurations (as requested by security policy)
const getEnvInt = (key: string, backup: number) => {
  return process.env[key] ? parseInt(process.env[key] as string, 10) : backup;
};

// Login rate limiter: Auth protection
export const loginRateLimiter = rateLimiter({
  windowMs: getEnvInt('AUTH_RATE_LIMIT_WINDOW', 15 * 60 * 1000), // Default 15m
  max: getEnvInt('AUTH_RATE_LIMIT_MAX_ATTEMPTS', 5), // Default 5
  message: 'Too many authentication attempts. Your IP has been temporarily logged and blocked.',
  keyPrefix: 'rl:login',
});

// Forgot Password rate limiter
export const forgotPasswordRateLimiter = rateLimiter({
  windowMs: getEnvInt('RESET_RATE_LIMIT_WINDOW', 15 * 60 * 1000),
  max: getEnvInt('RESET_RATE_LIMIT_MAX_ATTEMPTS', 3),
  message: 'Too many password reset requests. Please wait.',
  keyPrefix: 'rl:forgot-password',
});

// Register rate limiter
export const registerRateLimiter = rateLimiter({
  windowMs: getEnvInt('REGISTER_RATE_LIMIT_WINDOW', 60 * 60 * 1000),
  max: getEnvInt('REGISTER_RATE_LIMIT_MAX_ATTEMPTS', 3),
  message: 'Account creation rate limited to prevent spam.',
  keyPrefix: 'rl:register',
});

// General public API limits
export const generalRateLimiter = rateLimiter({
  windowMs: getEnvInt('API_RATE_LIMIT_WINDOW', 15 * 60 * 1000),
  max: getEnvInt('API_RATE_LIMIT_MAX_ATTEMPTS', 150),
  message: 'Too many API requests from this IP.',
  keyPrefix: 'rl:general',
});
