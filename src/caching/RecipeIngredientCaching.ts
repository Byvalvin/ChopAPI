import { RedisCaching } from './RedisCaching';
import { RecipeIngredient } from '../interface';

// RecipeIngredient-specific class extending RedisCaching
class RecipeIngredientCaching extends RedisCaching<RecipeIngredient> {
    // Implement the abstract method to return the type name
    constructor(){
        super('RecipeIngredient');
    }
}

const RecipeIngredientCache = new RecipeIngredientCaching();

export default RecipeIngredientCache;

/*
Singleton Pattern: By exporting a single instance (RecipeIngredientCache) and importing it wherever needed,
you ensure that the cache is shared across all parts of your application.
*/