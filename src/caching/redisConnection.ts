// redisClient.ts
import dotenv from 'dotenv';
dotenv.config();

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

const initializeRedis = async () => {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('[REDIS] Missing Upstash environment variables. Redis disabled.');
      return;
    }

    const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    await client.ping(); // test connection
    console.log('[REDIS] Connected to Upstash successfully.');
    redis = client;

  } catch (err) {
    console.error('[REDIS ERROR] Connection failed. Caching disabled.', err);
    redis = null;
  }
};

// Immediately initialize on import
await initializeRedis();

// import Redis from 'ioredis';
// const redis = new Redis({
//   host: process.env.UPSTASH_REDIS_REST_URL, // From Upstash dashboard
//   port: Number(process.env.REDIS_DEFAULT_PORT), // Default Redis port
//   password: process.env.UPSTASH_REDIS_REST_TOKEN, // From Upstash dashboard
// });


export default redis;
