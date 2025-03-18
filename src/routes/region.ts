import { Router } from "express";
import { 
    getAllRegions,
    getRegionById, getRegionNationsByRegionId,
    getRegionByRegionName, getRegionNationsByRegionName 
} from "../controllers/regionController";

const router = Router();

router.get('/', getAllRegions); // GET /chop/api/regions: Description: Fetch all available regions. Query parameters: sort, limit, page, search.
router.get('/:region_id', getRegionById); // GET /chop/api/regions/{id}: Description: Fetch region by region Id. No Query parameters
router.get('/:region_name/', getRegionByRegionName); // GET /chop/api/regions/{region_name}: Description: Fetch region by region name. No Query parameters
router.get('/:region_id/nations', getRegionNationsByRegionId); // GET /chop/api/regions/{id}: Description: Fetch nations of a region region id. No Query parameters
router.get('/:region_name/nations', getRegionNationsByRegionName); // GET /chop/api/regions/{region_name}: Description: Fetch nations of a region region name. Query parameters: sort, limit, page.

export default router;