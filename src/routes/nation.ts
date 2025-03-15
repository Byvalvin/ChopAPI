import { Router } from "express";
import { getAllNations } from "../controllers/nationController";

const router = Router();

router.get('/', getAllNations); // GET /chop/api/nations: Description: Fetch all available nations. Query parameters: sort, limit, page, search.

export default router;