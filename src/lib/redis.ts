import { Redis } from 'ioredis';

type RedisLike = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
};

const redisUrl = process.env.REDIS_URL;
const globalForRedis = global as unknown as { redis?: Redis | null };
let hasLoggedRedisFailure = false;

function logRedisFallback(message: string, error?: unknown) {
  if (hasLoggedRedisFailure) {
    return;
  }

  hasLoggedRedisFailure = true;
  console.warn(message, error);
}

function createRedisClient() {
  if (!redisUrl) {
    console.warn('REDIS_URL is not configured. Redis-backed rate limiting will be disabled.');
    return null;
  }

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  redis.on('error', (error) => {
    logRedisFallback('[redis] Redis connection is unavailable. Falling back to no-op rate limiting.', error);
  });

  return redis;
}

const client = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = client;
}

export function isRedisClientConfigured() {
  return Boolean(redisUrl && client);
}

export const redis: RedisLike = {
  async incr(key: string) {
    if (!client) {
      return 0;
    }
    try {
      return await client.incr(key);
    } catch (error) {
      logRedisFallback('[redis] Failed to increment Redis key. Falling back to no-op rate limiting.', error);
      return 0;
    }
  },
  async expire(key: string, seconds: number) {
    if (!client) {
      return 0;
    }
    try {
      return await client.expire(key, seconds);
    } catch (error) {
      logRedisFallback('[redis] Failed to set Redis expiry. Falling back to no-op rate limiting.', error);
      return 0;
    }
  },
};

export default redis;
