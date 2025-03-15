import { Router } from "express";
import { getAllSubcategories } from "../controllers/subcategoryController";

const router = Router();

router.get('/', getAllSubcategories); // GET /chop/api/subcategories: Description: Fetch all available subcategories. Query parameters: sort, limit, page, search.

export default router;