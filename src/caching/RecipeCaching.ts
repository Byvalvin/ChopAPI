import { RedisCaching } from './RedisCaching';
import Recipe from '../models/Recipe';

// Recipe-specific class extending RedisCaching
class RecipeCaching extends RedisCaching<Recipe> {
    // Implement the abstract method to return the type name
    constructor(){
        super('recipe');
    }
}

const RecipeCache = new RecipeCaching();

export default RecipeCache;

