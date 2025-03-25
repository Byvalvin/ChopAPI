import { Router } from "express";
import { getAllSubcategories } from "../controllers/subcategoryController";

const router = Router();

/**
 * @swagger
 * /chop/api/subcategories:
 *   get:
 *     summary: Fetch all available subcategories.
 *     description: |
 *       Fetch a list of all available subcategories with the option to filter and paginate the results.
 *       The response can be sorted and filtered by search term. If no subcategories are found, an empty list will be returned.
 *     parameters:
 *       - name: sort
 *         in: query
 *         description: The field to sort subcategories by.
 *         required: false
 *         schema:
 *           type: string
 *           example: "name"
 *       - name: limit
 *         in: query
 *         description: The number of results to return per page.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: page
 *         in: query
 *         description: The page number for paginated results.
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: search
 *         in: query
 *         description: A search term to filter subcategories by name.
 *         required: false
 *         schema:
 *           type: string
 *           example: "vegan"
 *     responses:
 *       200:
 *         description: A list of available subcategories, possibly filtered and paginated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: The total number of subcategories available.
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the subcategory.
 *                       name:
 *                         type: string
 *                         description: The name of the subcategory.
 *       400:
 *         description: Invalid query parameters (e.g., invalid limit, page, or sort).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error while fetching subcategories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *     tags:
 *       - Subcategories
 */
router.get('/', getAllSubcategories); // GET /chop/api/subcategories: Description: Fetch all available subcategories. Query parameters: sort, limit, page, search.

export default router;