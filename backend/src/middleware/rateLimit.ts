/**
 * @file        rateLimit.ts
 * @owner       Cybersecurity Team
 * @description Flood prevention rules limiting requests frequencies using Redis records.
 * @depends     services/cacheService.ts
 */

import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../services/cacheService';

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
      // If Redis client is not open/connected, fail-open gracefully to keep service online
      if (!redisClient.isOpen) {
        console.warn(`[RATE LIMIT] Redis is not connected. Bypassing rate limiting for prefix "${keyPrefix}".`);
        return next();
      }

      // Identify client by IP
      const ip = (
        req.ip ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        'unknown'
      ).toString();

      const key = `${keyPrefix}:${ip}`;

      // Increment count and get TTL atomically using multi transaction
      const results = await redisClient
        .multi()
        .incr(key)
        .ttl(key)
        .exec();

      if (!results || results.length < 2) {
        throw new Error('Redis transaction returned invalid result');
      }

      const count = results[0] as number;
      let ttl = results[1] as number;

      // If the key is new (count === 1) or has no expiration (ttl === -1)
      if (ttl === -1 || count === 1) {
        await redisClient.expire(key, windowSeconds);
        ttl = windowSeconds;
      }

      const remaining = Math.max(0, max - count);
      const resetTime = Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);

      // Set RFC-compliant HTTP headers for rate limiting
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      if (count > max) {
        console.warn(`[RATE LIMIT] Rate limit exceeded for IP ${ip} on key prefix ${keyPrefix}`);
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
      // Fail-open
      next();
    }
  };
};

// Pre-configured rate limiters

// Login rate limiter: 5 attempts per 15 minutes
export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  keyPrefix: 'rl:login',
});

// Forgot Password rate limiter: 3 requests per 15 minutes
export const forgotPasswordRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again after 15 minutes.',
  keyPrefix: 'rl:forgot-password',
});

// Register rate limiter: 5 registrations per hour
export const registerRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many account creation attempts. Please try again after an hour.',
  keyPrefix: 'rl:register',
});

// General rate limiter: 100 requests per 15 minutes
export const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please try again later.',
  keyPrefix: 'rl:general',
});
