import redis from './redisConnection';

// Abstract base class for Redis caching
export abstract class RedisCaching<T> {
    Type : string;
    
    constructor(type:string){
        this.Type = type;
    }

    // Define a common cache key format
    static keyFormat = ():string => `type:{id}`;
    // the cache key
    key = (id:number)=>`${this.Type}:${id}`;
    // Abstract method to get the object type, to be implemented in subclasses
    getType = ():string => this.Type;
    
    // Set cache for a specific object
    setCache = async(id: number, data: T):Promise<void> => {
        try {
            const cacheKey = this.key(id);
            await redis.setex(cacheKey, 3600, JSON.stringify(data));  // Cache for 1 hour
            console.log(`${this.getType()} ${id} cached`);
        } catch (err) {
            console.error('Error caching:', err);
        }
    }

    // Get cache for a specific object
    async getCache(id: number): Promise<T | null> {
        try {
            const cacheKey = this.key(id);
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log(`Cache hit for ${this.getType()} ${id}`);
                return cachedData as T;
                //return JSON.parse(cachedData) as T;  // Cast to type T
            } else {
                return null;  // Cache miss
            }
        } catch (err) {
            console.error('Error getting cache:', err);
            return null;  // Return null if Redis fails
        }
    }

    // Invalidate cache for a specific object
    async invalidateCache(id: number): Promise<void> {
        try {
            const cacheKey = this.key(id);
            await redis.del(cacheKey);
            console.log(`${this.getType()} ${id} cache invalidated`);
        } catch (err) {
            console.error('Error invalidating cache:', err);
        }
    }

    // Function to clear the entire Redis cache (flush all keys)
    static clearCache = async () => {
        try {
            // Flush all keys in the currently selected database
            await redis.flushdb(); // Use flushall() to clear all databases
            console.log("Redis cache cleared successfully.");
        } catch (err) {
            console.error("Error clearing Redis cache:", err);
        }
    };
}
