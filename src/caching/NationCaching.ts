import { RedisCaching } from './RedisCaching';
import { Nation } from '../interface';

// Nation-specific class extending RedisCaching
class NationCaching extends RedisCaching<Nation> {
    // Implement the abstract method to return the type name
    constructor(){
        super('nation');
    }
}

const NationCache = new NationCaching();

export default NationCache;

