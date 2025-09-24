import redis from './redisConnection';

export abstract class RedisCaching<T> {
  Type: string;

  constructor(type: string) {
    this.Type = type;
  }

  key = (id: number) => `${this.Type}:${id}`;

  getType = (): string => this.Type;

  setCache = async (id: number, data: T): Promise<void> => {
    if (!redis) {
      console.warn(`[CACHE DISABLED] Skipping cache set for ${this.Type} ${id}`);
      return;
    }

    try {
      await redis.set(this.key(id), JSON.stringify(data), { ex: 3600 }); // 1 hour
      console.log(`[CACHE SET] ${this.Type}:${id}`);
    } catch (err) {
      console.error(`[CACHE ERROR] setCache for ${this.Type} ${id}:`, err);
    }
  };

  getCache = async (id: number): Promise<T | null> => {
    if (!redis) {
      console.warn(`[CACHE DISABLED] Skipping cache get for ${this.Type} ${id}`);
      return null;
    }

    try {
      const cached = await redis.get(this.key(id));
      if (cached) {
        console.log(`[CACHE HIT] ${this.Type}:${id}`);
        return JSON.parse(cached as string) as T;
      }
    } catch (err) {
      console.error(`[CACHE ERROR] getCache for ${this.Type} ${id}:`, err);
    }

    return null;
  };

  invalidateCache = async (id: number): Promise<void> => {
    if (!redis) {
      console.warn(`[CACHE DISABLED] Skipping cache invalidate for ${this.Type} ${id}`);
      return;
    }

    try {
      await redis.del(this.key(id));
      console.log(`[CACHE INVALIDATE] ${this.Type}:${id}`);
    } catch (err) {
      console.error(`[CACHE ERROR] invalidateCache for ${this.Type} ${id}:`, err);
    }
  };

  static clearCache = async () => {
    if (!redis) {
      console.warn(`[CACHE DISABLED] Skipping full cache clear`);
      return;
    }

    try {
      await redis.flushdb(); // Only works if Upstash supports it
      console.log(`[CACHE CLEARED]`);
    } catch (err) {
      console.error(`[CACHE ERROR] clearCache:`, err);
    }
  };
}
