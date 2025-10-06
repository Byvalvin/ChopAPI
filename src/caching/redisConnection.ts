// redisClient.ts
import dotenv from 'dotenv';


// Load environment variables from .env file
dotenv.config();

// Use Singleton Pattern

// Replace these with your Upstash Redis connection credentials. tHIS IS THE REDIS CLIENT
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,  // From Upstash dashboard
  token: process.env.UPSTASH_REDIS_REST_TOKEN,  // From Upstash dashboard
});

// Test the Redis connection by performing a simple ping (if successful, Redis is working)
const testConnection = async () => {
  try {
    // Pinging Redis server to check connectivity
    await redis.ping();
    console.log("Redis connection successful!");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
};

// Call the test connection function to log success/failure
testConnection();
// await redis.set('foo', 'bar');
// const data = await redis.get('foo');




// import Redis from 'ioredis';
// const redis = new Redis({
//   host: process.env.UPSTASH_REDIS_REST_URL, // From Upstash dashboard
//   port: Number(process.env.REDIS_DEFAULT_PORT), // Default Redis port
//   password: process.env.UPSTASH_REDIS_REST_TOKEN, // From Upstash dashboard
// });


export default redis;
