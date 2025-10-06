// redisClient.ts
import dotenv from 'dotenv';
dotenv.config();

import { Redis } from '@upstash/redis';

let client: Redis | null = null;
client = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const testConnection = async ()=>{
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('[REDIS] Missing Upstash environment variables. Redis disabled.');
    client = null
    return;
  }
  try {
    await client.ping(); // test connection
    console.log('[REDIS] Connected to Upstash successfully.');
  } catch (err) {
    console.error('[REDIS ERROR] Connection failed. Caching disabled.', err);
    client = null;
  }
}


// Call the test connection function to log success/failure
testConnection();

// import Redis from 'ioredis';
// const redis = new Redis({
//   host: process.env.UPSTASH_REDIS_REST_URL, // From Upstash dashboard
//   port: Number(process.env.REDIS_DEFAULT_PORT), // Default Redis port
//   password: process.env.UPSTASH_REDIS_REST_TOKEN, // From Upstash dashboard
// });

const redis = client;
export default redis;
