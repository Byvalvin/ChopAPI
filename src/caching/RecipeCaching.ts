import { RedisCaching } from './RedisCaching';
import { Recipe } from '../interface';

// Recipe-specific class extending RedisCaching
class RecipeCaching extends RedisCaching<Recipe> {
    // Implement the abstract method to return the type name
    constructor(){
        super('recipe');
    }
}

const RecipeCache = new RecipeCaching();

export default RecipeCache;


/*
Singleton Pattern: By exporting a single instance (RecipeCache) and importing it wherever needed,
you ensure that the cache is shared across all parts of your application.
*/