/**
 * @file        cacheService.ts
 * @owner       IT Team
 * @description Redis cache key getters and setters helper routines.
 * @depends     None
 */

import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('[REDIS] Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('[REDIS] Connecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('[REDIS] Client ready and connected.');
});

let connectionPromise: Promise<void> | null = null;

/**
 * Establish a connection to the Redis server if not already connected.
 */
export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    return;
  }
  if (!connectionPromise) {
    connectionPromise = redisClient.connect().then(() => {
      connectionPromise = null;
    }).catch((err) => {
      console.error('[REDIS] Connection failed:', err);
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
};

// Start connection background attempt but handle failures gracefully
connectRedis().catch(() => {});

/**
 * Get a cached value by key.
 */
export const getCache = async (key: string): Promise<string | null> => {
  try {
    if (!redisClient.isReady) return null;
    return await redisClient.get(key);
  } catch (error) {
    console.error(`[CACHE] Get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set a cached value with optional expiration in seconds.
 */
export const setCache = async (key: string, value: string, expireSeconds?: number): Promise<void> => {
  try {
    if (!redisClient.isReady) return;
    if (expireSeconds) {
      await redisClient.set(key, value, { EX: expireSeconds });
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error(`[CACHE] Set error for key ${key}:`, error);
  }
};

/**
 * Delete a cached value by key.
 */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (!redisClient.isReady) return;
    await redisClient.del(key);
  } catch (error) {
    console.error(`[CACHE] Delete error for key ${key}:`, error);
  }
};
