import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

if (!process.env.REDIS_URL) {
  console.warn("REDIS_URL is not defined in .env.local, falling back to local redis.");
}

// Ensure single instance in dev
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis || new Redis(redisUrl);

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
