import { Router } from "express";
import { getAllNations, getNationById } from "../controllers/nationController";

const router = Router();

/**
 * @swagger
 * /chop/api/nations:
 *   get:
 *     summary: Fetch all available nations.
 *     description: |
 *       Fetch a list of all available nations with the option to filter, sort, and paginate the results.
 *       If no nations are found, an empty list will be returned.
 *     parameters:
 *       - name: sort
 *         in: query
 *         description: The field to sort nations by (default is by name).
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
 *         description: A search term to filter nations by name.
 *         required: false
 *         schema:
 *           type: string
 *           example: "Germany"
 *     responses:
 *       200:
 *         description: A list of available nations, possibly filtered, sorted, and paginated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: The total number of nations available.
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the nation.
 *                       name:
 *                         type: string
 *                         description: The name of the nation.
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
 *         description: Internal server error while fetching nations.
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
 *       - Nations
 */
router.get('/', getAllNations); // GET /chop/api/nations: Description: Fetch all available nations. Query parameters: sort, limit, page, search.



/**
 * @swagger
 * /chop/api/nations:
 *   get:
 *     summary: Fetch all available nations.
 *     description: |
 *       Fetch a list of all available nations with the option to filter, sort, and paginate the results.
 *       If no nations are found, an empty list will be returned.
 *     parameters:
 *       - name: sort
 *     responses:
 *       200:
 *         description: nation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique identifier of the nation.
 *                     name:
 *                         type: string
 *                         description: The name of the nation.

 *       400:
 *         description: Invalid ID format.
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
 *         description: Internal server error while fetching nations.
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
 *       - Nations
 */
router.get('/:nation_id', getNationById);

export default router;

