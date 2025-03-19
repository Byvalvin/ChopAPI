import { RedisCaching } from './RedisCaching';
import { Category } from '../interface';

// Category-specific class extending RedisCaching
class CategoryCaching extends RedisCaching<Category> {
    // Implement the abstract method to return the type name
    constructor(){
        super('category');
    }
}

const CategoryCache = new CategoryCaching();

export default CategoryCache;

