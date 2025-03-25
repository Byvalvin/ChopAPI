import { Router } from "express";

import { getAllIngredients, getRecipesThatUseIngredientById, getRecipeThatUseIngredientByName } from '../controllers/ingredientController';


const router = Router();

// ROUTES

/**
 * @swagger
 * /chop/api/ingredients:
 *   get:
 *     summary: Fetch all available ingredients.
 *     description: |
 *       Fetch a list of all available ingredients, with optional filtering and pagination. You can filter ingredients by various parameters, such as search term, and sort them by specific fields.
 *     parameters:
 *       - name: sort
 *         in: query
 *         description: Specify the field to sort by (e.g., "name"). Defaults to sorting by name.
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - category
 *             - cost
 *       - name: limit
 *         in: query
 *         description: Number of ingredients to fetch per page. Defaults to 10, max is 100.
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
 *         description: Search for ingredients by keyword (e.g., name or category).
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of ingredients with detailed information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: Total number of ingredients that match the filters.
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the ingredient.
 *                       name:
 *                         type: string
 *                         description: The name of the ingredient.
 *                       category:
 *                         type: string
 *                         description: The category the ingredient belongs to.
 *                       cost:
 *                         type: integer
 *                         description: The cost of the ingredient.
 *                       description:
 *                         type: string
 *                         description: A short description of the ingredient.
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               description: URL to the image.
 *                             caption:
 *                               type: string
 *                               description: A short caption for the image.
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
 *         description: Internal server error while fetching ingredients.
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
 *       - Ingredients
 */
router.get('/', getAllIngredients); // GET /chop/api/ingredients: Fetch all available ingredients. Query parameters: sort, limit, page, search.


/**
 * @swagger
 * /chop/api/ingredients/{ingredient_id}/recipes:
 *   get:
 *     summary: Fetch all available recipes that require a specific ingredient by ID.
 *     description: |
 *       Fetch a list of recipes that include the specified ingredient. You can filter the results by various criteria, including category, subcategory, nation, region, time, cost, and more.
 *     parameters:
 *       - name: ingredient_id
 *         in: path
 *         description: The unique identifier for the ingredient.
 *         required: true
 *         schema:
 *           type: integer
 *       - name: category
 *         in: query
 *         description: Filter recipes by category.
 *         required: false
 *         schema:
 *           type: string
 *       - name: sub_category
 *         in: query
 *         description: Filter recipes by subcategory.
 *         required: false
 *         schema:
 *           type: string
 *       - name: nation
 *         in: query
 *         description: Filter recipes by nation.
 *         required: false
 *         schema:
 *           type: string
 *       - name: region
 *         in: query
 *         description: Filter recipes by region.
 *         required: false
 *         schema:
 *           type: string
 *       - name: time
 *         in: query
 *         description: Filter recipes by cooking time.
 *         required: false
 *         schema:
 *           type: string
 *       - name: cost
 *         in: query
 *         description: Filter recipes by cost.
 *         required: false
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         description: Specify the field to sort by (e.g., "name", "time"). Defaults to sorting by recipe name.
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - time
 *             - cost
 *       - name: limit
 *         in: query
 *         description: Number of recipes to fetch per page. Defaults to 10, max is 100.
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
 *         description: Search for recipes that include the ingredient, by name or description.
 *         required: false
 *         schema:
 *           type: string
 *       - name: amount
 *         in: query
 *         description: Filter recipes by the amount of the ingredient used.
 *         required: false
 *         schema:
 *           type: string
 *       - name: unit
 *         in: query
 *         description: Filter recipes by the unit of the ingredient (e.g., grams, cups).
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of recipes that use the specified ingredient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: The total number of recipes found.
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the recipe.
 *                       name:
 *                         type: string
 *                         description: The name of the recipe.
 *                       description:
 *                         type: string
 *                         description: A brief description of the recipe.
 *                       ingredients:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             quantity:
 *                               type: string
 *                             unit:
 *                               type: string
 *                       time:
 *                         type: string
 *                         description: The time required to prepare the recipe.
 *                       cost:
 *                         type: string
 *                         description: The estimated cost of the recipe.
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
 *         description: No recipes found that include the specified ingredient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error while fetching recipes.
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
 *       - Ingredients
 */
router.get('/:ingredient_id/recipes', getRecipesThatUseIngredientById); // GET /chop/api/ingredients/{id}/recipes: Fetch all available recipes that require a specific ingredient by id. Query parameters: Filter by category, sub_category, nation, region, time, cost, sort, limit, page, search, amount, unit.


/**
 * @swagger
 * /chop/api/ingredients/{ingredient_name}/recipes:
 *   get:
 *     summary: Fetch all available recipes that require a specific ingredient by name.
 *     description: |
 *       Fetch a list of recipes that include the specified ingredient. You can filter the results by various criteria, including category, subcategory, nation, region, time, cost, and more.
 *     parameters:
 *       - name: ingredient_name
 *         in: path
 *         description: The name of the ingredient (case-insensitive).
 *         required: true
 *         schema:
 *           type: string
 *       - name: category
 *         in: query
 *         description: Filter recipes by category.
 *         required: false
 *         schema:
 *           type: string
 *       - name: sub_category
 *         in: query
 *         description: Filter recipes by subcategory.
 *         required: false
 *         schema:
 *           type: string
 *       - name: nation
 *         in: query
 *         description: Filter recipes by nation.
 *         required: false
 *         schema:
 *           type: string
 *       - name: region
 *         in: query
 *         description: Filter recipes by region.
 *         required: false
 *         schema:
 *           type: string
 *       - name: time
 *         in: query
 *         description: Filter recipes by cooking time.
 *         required: false
 *         schema:
 *           type: string
 *       - name: cost
 *         in: query
 *         description: Filter recipes by cost.
 *         required: false
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         description: Specify the field to sort by (e.g., "name", "time"). Defaults to sorting by recipe name.
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - time
 *             - cost
 *       - name: limit
 *         in: query
 *         description: Number of recipes to fetch per page. Defaults to 10, max is 100.
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
 *         description: Search for recipes that include the ingredient, by name or description.
 *         required: false
 *         schema:
 *           type: string
 *       - name: amount
 *         in: query
 *         description: Filter recipes by the amount of the ingredient used.
 *         required: false
 *         schema:
 *           type: string
 *       - name: unit
 *         in: query
 *         description: Filter recipes by the unit of the ingredient (e.g., grams, cups).
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of recipes that use the specified ingredient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: The total number of recipes found.
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the recipe.
 *                       name:
 *                         type: string
 *                         description: The name of the recipe.
 *                       description:
 *                         type: string
 *                         description: A brief description of the recipe.
 *                       ingredients:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             quantity:
 *                               type: string
 *                             unit:
 *                               type: string
 *                       time:
 *                         type: string
 *                         description: The time required to prepare the recipe.
 *                       cost:
 *                         type: string
 *                         description: The estimated cost of the recipe.
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
 *         description: No recipes found that include the specified ingredient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error while fetching recipes.
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
 *       - Ingredients
 */
router.get('/:ingredient_name/recipes', getRecipeThatUseIngredientByName); // GET /chop/api/ingredients/{ingredient_name}/recipes: Fetch all available recipes that require a specific ingredient by name. Query parameters: Filter by category, sub_category, nation, region, time, cost, sort, limit, page, search, amount, unit.


export default router;

