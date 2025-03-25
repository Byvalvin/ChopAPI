import { Router } from "express";
import { getAllCategories } from "../controllers/categoryController";


const router = Router();

// ROUTES
/**
 * @swagger
 * /chop/api/categories:
 *   get:
 *     summary: Fetch all available categories.
 *     description: |
 *       Fetch a list of all available categories with the option to filter and paginate the results.
 *       The response can be sorted and filtered by search term. If no categories are found, an empty list will be returned.
 *     parameters:
 *       - name: sort
 *         in: query
 *         description: The field to sort categories by.
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
 *         description: A search term to filter categories by name.
 *         required: false
 *         schema:
 *           type: string
 *           example: "dessert"
 *     responses:
 *       200:
 *         description: A list of available categories, possibly filtered and paginated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: The total number of categories available.
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the category.
 *                       name:
 *                         type: string
 *                         description: The name of the category.
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
 *         description: Internal server error while fetching categories.
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
 *       - Categories
 */
router.get('/', getAllCategories); // GET /chop/api/categories: Description: Fetch all available categories. Query parameters: sort, limit, page, search.

export default router;