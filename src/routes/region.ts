import { Router } from "express";
import { 
    getAllRegions,
    getRegionById, getRegionNationsByRegionId,
    getRegionByRegionName, getRegionNationsByRegionName 
} from "../controllers/regionController";

const router = Router();

router.get('/', getAllRegions);
router.get('/:region_id', getRegionById);
router.get('/:region_name/', getRegionByRegionName);
router.get('/:region_id/nations', getRegionNationsByRegionId);
router.get('/:region_name/nations', getRegionNationsByRegionName);

export default router;