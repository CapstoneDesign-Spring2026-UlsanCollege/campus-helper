import { Redis } from 'ioredis';

type RedisLike = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
};

const redisUrl = process.env.REDIS_URL;
const globalForRedis = global as unknown as { redis?: Redis | null };

function createRedisClient() {
  if (!redisUrl) {
    console.warn('REDIS_URL is not configured. Rate limiting will run in degraded mode.');
    return null;
  }

  return new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
}

const client = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = client;
}

export const redis: RedisLike = {
  async incr(key: string) {
    if (!client) return 0;
    return client.incr(key);
  },
  async expire(key: string, seconds: number) {
    if (!client) return 0;
    return client.expire(key, seconds);
  },
};

export default redis;
