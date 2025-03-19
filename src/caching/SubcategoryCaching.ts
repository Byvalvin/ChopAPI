import { RedisCaching } from './RedisCaching';
import { Subcategory } from '../interface';

// Subcategory-specific class extending RedisCaching
class SubcategoryCaching extends RedisCaching<Subcategory> {
    // Implement the abstract method to return the type name
    constructor(){
        super('subcategory');
    }
}

const SubcategoryCache = new SubcategoryCaching();

export default SubcategoryCache;


/*
Singleton Pattern: By exporting a single instance (SubcategoryCache) and importing it wherever needed,
you ensure that the cache is shared across all parts of your application.
*/