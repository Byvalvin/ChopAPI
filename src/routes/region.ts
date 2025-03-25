import { Router } from "express";
import { 
    getAllRegions,
    getRegionById, getRegionNationsByRegionId,
    getRegionByRegionName, getRegionNationsByRegionName 
} from "../controllers/regionController";

const router = Router();

/**
 * @swagger
 * /chop/api/regions:
 *   get:
 *     summary: Fetch all available regions.
 *     description: |
 *       Fetch a list of all regions. You can filter, sort, and paginate the results using query parameters.
 *     parameters:
 *       - name: nation
 *         in: query
 *         description: Filter regions by nation.
 *         required: false
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         description: Specify the field to sort by (e.g., "name"). Defaults to sorting by region name.
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - code
 *       - name: limit
 *         in: query
 *         description: Number of regions to fetch per page. Defaults to 10, max is 100.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *       - name: page
 *         in: query
 *         description: The page number of results to retrieve. Defaults to 1.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - name: search
 *         in: query
 *         description: Search for regions by name or other criteria.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of regions, with optional pagination and sorting.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: The total number of regions found.
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the region.
 *                       name:
 *                         type: string
 *                         description: The name of the region.
 *                       code:
 *                         type: string
 *                         description: The unique code for the region.
 *       400:
 *         description: Invalid query parameters.
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
 *         description: Internal server error while fetching regions.
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
 *       - Regions
 */
router.get('/', getAllRegions); // GET /chop/api/regions: Fetch all available regions. Query parameters: sort, limit, page, search.


/**
 * @swagger
 * /chop/api/regions/{region_id}:
 *   get:
 *     summary: Fetch region by region ID.
 *     description: |
 *       Fetch the details of a specific region by its unique ID.
 *       If the provided ID is invalid or the region does not exist, an error message will be returned.
 *     parameters:
 *       - name: region_id
 *         in: path
 *         description: The unique ID of the region.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Region details for the specified region ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the region.
 *                 name:
 *                   type: string
 *                   description: The name of the region.
 *                 code:
 *                   type: string
 *                   description: The unique code of the region.
 *       400:
 *         description: Invalid region ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid ID format"
 *       404:
 *         description: Region not found for the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Region with id: {regionId} not found"
 *       500:
 *         description: Internal server error while fetching region details.
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
 *       - Regions
 */
router.get('/:region_id', getRegionById); // GET /chop/api/regions/{id}: Fetch region by region Id. No Query parameters


/**
 * @swagger
 * /chop/api/regions/{region_name}:
 *   get:
 *     summary: Fetch region by region name.
 *     description: |
 *       Fetch the details of a specific region by its name. The name is case-insensitive and can be partially matched.
 *       If no region is found with the provided name, an error message will be returned.
 *     parameters:
 *       - name: region_name
 *         in: path
 *         description: The name of the region to search for.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Region details for the specified region name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the region.
 *                 name:
 *                   type: string
 *                   description: The name of the region.
 *                 code:
 *                   type: string
 *                   description: The unique code of the region.
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Region not found with the given name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Region with name: {region_name} not found"
 *       500:
 *         description: Internal server error while fetching region details.
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
 *       - Regions
 */
router.get('/:region_name', getRegionByRegionName); // GET /chop/api/regions/{region_name}: Fetch region by region name. No Query parameters


/**
 * @swagger
 * /chop/api/regions/{region_id}/nations:
 *   get:
 *     summary: Fetch nations of a specific region by region id.
 *     description: |
 *       Fetch a list of nations associated with a specific region using the region’s unique ID. 
 *       If no region is found with the provided ID, an error message will be returned.
 *     parameters:
 *       - name: region_id
 *         in: path
 *         description: The unique ID of the region to fetch nations for.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of nations for the specified region ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the region.
 *                 nations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of nation names associated with the region.
 *       400:
 *         description: Invalid region ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid ID format"
 *       404:
 *         description: Region not found with the given ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Region with id: {region_id} not found"
 *       500:
 *         description: Internal server error while fetching the nations of the region.
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
 *       - Regions
 */
router.get('/:region_id/nations', getRegionNationsByRegionId); // GET /chop/api/regions/{region_id}/nations: Fetch nations of a region by region ID

/**
 * @swagger
 * /chop/api/regions/{region_name}/nations:
 *   get:
 *     summary: Fetch nations of a specific region by region name.
 *     description: |
 *       Fetch a list of nations associated with a specific region using the region’s name. 
 *       The response can be filtered and paginated with query parameters for sorting, limit, and page. 
 *       If no region is found with the provided name, an error message will be returned.
 *     parameters:
 *       - name: region_name
 *         in: path
 *         description: The name of the region to fetch nations for.
 *         required: true
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         description: The field to sort by.
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
 *     responses:
 *       200:
 *         description: A list of nations for the specified region name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the region.
 *                 nations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of nation names associated with the region.
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
 *       404:
 *         description: Region not found with the given name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Region with name: {region_name} not found"
 *       500:
 *         description: Internal server error while fetching the nations of the region.
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
 *       - Regions
 */
router.get('/:region_name/nations', getRegionNationsByRegionName); // GET /chop/api/regions/{region_name}/nations: Fetch nations of a region by region name


export default router;