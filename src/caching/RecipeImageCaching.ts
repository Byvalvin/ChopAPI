import { RedisCaching } from './RedisCaching';
import { Image } from '../interface';

// RecipeImage-specific class extending RedisCaching
class RecipeImageCaching extends RedisCaching<Image> {
    // Implement the abstract method to return the type name
    constructor(){
        super('RecipeImage');
    }
}

const RecipeImageCache = new RecipeImageCaching();

export default RecipeImageCache;


