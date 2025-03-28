import { RedisCaching } from './RedisCaching';
import { Region } from '../interface';

// Region-specific class extending RedisCaching
class RegionDetailCaching extends RedisCaching<Region> {
    // Implement the abstract method to return the type name
    constructor(){
        super('regionDetail');
    }
}

const RegionDetailCache = new RegionDetailCaching();

export default RegionDetailCache;
