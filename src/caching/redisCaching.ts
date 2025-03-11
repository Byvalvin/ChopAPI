// cache.ts
import { Recipe as RecipeI } from '../interface';
import redis from './redisConnection';

// recipe caching
const recipeCacheKey = (recipeId:number)=>`recipe:${recipeId}`;

// Set cache for a recipe
export const setRecipeCache = async (recipeId: number, recipeData: any) => {
    try {
        const cacheKey = recipeCacheKey(recipeId);
        await redis.setex(cacheKey, 3600, JSON.stringify(recipeData));  // Cache for 1 hour
        console.log(`Recipe ${recipeId} cached`);
    } catch (err) {
        console.error('Error caching recipe:', err);
    }
};

// Get cache for a recipe
// cache.ts
export const getRecipeCache = async (recipeId: number) => {
    try {
        const cacheKey = recipeCacheKey(recipeId);
        const cachedData = await redis.get(cacheKey);
        //console.log(cachedData);
        if (cachedData) {
            console.log(`Cache hit for recipe ${recipeId}`);
            return cachedData as RecipeI;
        } else {
            return null;  // Cache miss
        }
    } catch (err) {
        console.error('Error getting cache:', err);
        return null;  // Return null if Redis fails, so you can still query the database
    }
};


// Invalidate cache for a recipe (when the recipe is updated)
export const invalidateRecipeCache = async (recipeId: number) => {
    try {
        const cacheKey = `recipe:${recipeId}`;
        await redis.del(cacheKey);
        console.log(`Recipe ${recipeId} cache invalidated`);
    } catch (err) {
        console.error('Error invalidating cache:', err);
    }
};

// Function to clear the entire Redis cache (flush all keys)
export const clearRedisCache = async () => {
    try {
        // Flush all keys in the currently selected database
        await redis.flushdb(); // Use flushall() to clear all databases
        console.log("Redis cache cleared successfully.");
    } catch (err) {
        console.error("Error clearing Redis cache:", err);
    }
};