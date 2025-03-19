import { RedisCaching } from './RedisCaching';
import { Region } from '../interface';

// Region-specific class extending RedisCaching
class RegionCaching extends RedisCaching<Region> {
    // Implement the abstract method to return the type name
    constructor(){
        super('region');
    }
}

const RegionCache = new RegionCaching();

export default RegionCache;
