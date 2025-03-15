import { Router } from "express";
import { getAllCategories } from "../controllers/categoryController";


const router = Router();

// ROUTES
router.get('/', getAllCategories); // GET /chop/api/categories: Description: Fetch all available categories. Query parameters: sort, limit, page, search.

export default router;