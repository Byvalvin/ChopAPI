import { RedisCaching } from './RedisCaching';
import { Ingredient } from '../interface';

// Ingredient-specific class extending RedisCaching
class IngredientCaching extends RedisCaching<Ingredient> {
    // Implement the abstract method to return the type name
    constructor(){
        super('ingredient');
    }
}

const IngredientCache = new IngredientCaching();

export default IngredientCache;

