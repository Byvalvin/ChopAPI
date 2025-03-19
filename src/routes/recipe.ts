import { Router } from 'express';
import {
    addRecipe, addAliasToRecipeById, addRecipeIngredientsById, addRecipeCategoriesById, addRecipeSubcategoriesById, addRecipeImageById,
    updateRecipeById,
    getAllRecipes, getRecipeById, getAllRecipeWithName,
    getRecipeNamesById, getRecipeIngredientsById, getRecipeInstructionsById, getRecipeCategoriesById, getRecipeSubcategoriesById, getRecipeImagesById,
    replaceRecipeById, replaceAliasForRecipeById, replaceRecipeIngredientsById, replaceRecipeInstructionsById,
    removeRecipeIngredientByIdandIngredientId, removeRecipeCategoryByIdandCategoryId, removeRecipeSubcategoriesByIdandSubcategoryId, removeRecipeImageByIdandImageId,
    deleteRecipeById,
    
} from '../controllers/recipeController';
/*
GET /chop/api/recipes?category=main
GET /chop/api/recipes?category=main,vegetarian
GET /chop/api/recipes?category=main,vegetarian&sub_category=spicy,gluten-free
GET http://localhost:3000/chop/api/recipes?category=Main&sort=name&limit=2&page=1&search=recipe
http://localhost:3000/chop/api/recipes?subcategory=spicy&category=main
GET /chop/api/recipes?search=recipe  // Will search for 'recipe' in the main name
GET /chop/api/recipes?search=alternative  // Will search for 'alternative' in both the main name and other names
*/
// Create a new router for the /api/recipes route
const router = Router();

//ROUTES

// Protected route: delete recipe (only accessible to authenticated users)
import { authMiddleware } from '../middleware/authentication';
router.delete('/:id', authMiddleware, deleteRecipeById);
/**
 * @swagger
 * /chop/api/recipes:
 *   get:
 *     summary: Fetch all available recipes.
 *     description: |
 *       Fetch a list of all available recipes. You can filter recipes by various parameters such as category, subcategory, nation, region, time, cost, and more.
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter recipes by category.
 *         required: false
 *         schema:
 *           type: string
 *       - name: subcategory
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
 *         description: Filter recipes by preparation time.
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
 *         description: Specify the field to sort by (e.g., name).
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
 *         description: Search for recipes by keyword.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of recipes with detailed information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: Total number of recipes that match the filters.
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
 *                         description: A short description of the recipe.
 *                       nation:
 *                         type: string
 *                         description: The nation the recipe is associated with.
 *                       region:
 *                         type: string
 *                         description: The region the recipe is associated with.
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of categories for the recipe (e.g., "Main", "Vegetarian").
 *                       subcategories:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of subcategories for the recipe (e.g., "Quick", "Vegetarian").
 *                       aliases:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of alternative names for the recipe.
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               description: The URL to the image.
 *                             type:
 *                               type: string
 *                               description: The type of image (e.g., "thumbnail", "full-size").
 *                             caption:
 *                               type: string
 *                               description: A short caption describing the image.
 *                       time:
 *                         type: integer
 *                         description: Preparation time in minutes.
 *                       cost:
 *                         type: integer
 *                         description: The cost of the recipe.
 *                       ingredients:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the ingredient.
 *                             quantity:
 *                               type: integer
 *                               description: The quantity of the ingredient.
 *                             unit:
 *                               type: string
 *                               description: The unit of measurement (e.g., "grams", "pieces").
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
 *       - Recipes
 */
router.get('/',  getAllRecipes); // GET /chop/api/recipes: Description: Fetch all available recipes. Query parameters: Filter by category, subcategory, nation, region, time, cost, sort, limit, page, search.

/**
 * @swagger
 * /chop/api/recipes:
 *   post:
 *     summary: Add a new recipe.
 *     description: |
 *       Add a new recipe to the system. You must provide the required fields in the request body, such as name, description, nation, region, ingredients, and instructions. Optionally, you can also provide aliases, categories, subcategories, images, cost, and preparation time.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - nation
 *               - region
 *               - ingredients
 *               - instructions
 *               - time
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the recipe.
 *               description:
 *                 type: string
 *                 description: A short description of the recipe.
 *               nation:
 *                 type: string
 *                 description: The nation the recipe is associated with.
 *               region:
 *                 type: string
 *                 description: The region the recipe is associated with.
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the ingredient.
 *                     quantity:
 *                       type: integer
 *                       description: The quantity of the ingredient.
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement (e.g., grams, pieces).
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Step-by-step instructions to prepare the recipe.
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of alternative names for the recipe.
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of categories the recipe belongs to (e.g., "Main", "Vegetarian").
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: A list of subcategories for the recipe (e.g., "Quick", "Vegetarian").
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: The URL to the image.
 *                     type:
 *                       type: string
 *                       description: The type of image (e.g., "thumbnail", "full-size").
 *                     caption:
 *                       type: string
 *                       description: A short caption describing the image.
 *               time:
 *                 type: integer
 *                 description: Preparation time in minutes.
 *               cost:
 *                 type: integer
 *                 description: The cost of the recipe in your currency. Defaults to 0 if not provided.
 *     responses:
 *       201:
 *         description: Recipe successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating the new recipe has been added.
 *       400:
 *         description: Missing required fields or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message explaining what went wrong.
 *       500:
 *         description: Internal server error while adding the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: The technical error information.
 *     tags:
 *       - Recipes
 */
router.post('/', addRecipe); // POST /chop/api/recipes: Description: Add a new recipe. Request body with new recipe data.

/**
 * @swagger
 * /chop/api/recipes/{id}:
 *   get:
 *     summary: Fetch recipe by ID.
 *     description: |
 *       Retrieve the details of a specific recipe by its ID. The ID must be numeric and provided as part of the URL path.
 *       If the recipe with the given ID does not exist, a 404 error is returned.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the recipe.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: The recipe details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                 name:
 *                   type: string
 *                   description: The name of the recipe.
 *                 description:
 *                   type: string
 *                   description: A brief description of the recipe.
 *                 nation:
 *                   type: string
 *                   description: The nation the recipe is associated with.
 *                 region:
 *                   type: string
 *                   description: The region the recipe is associated with.
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the ingredient.
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the ingredient.
 *                       unit:
 *                         type: string
 *                         description: The unit of measurement for the ingredient (e.g., grams, pieces).
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Step-by-step instructions to prepare the recipe.
 *                 time:
 *                   type: integer
 *                   description: The preparation time in minutes.
 *                 cost:
 *                   type: integer
 *                   description: The cost of the recipe in your currency.
 *       400:
 *         description: Invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message explaining the invalid ID.
 *       404:
 *         description: Recipe not found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the recipe was not found.
 *       500:
 *         description: Internal server error while fetching recipe details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: The technical error information.
 *     tags:
 *       - Recipes
 */
router.get('/:id', getRecipeById); // GET /chop/api/recipes/{id}: Description: Fetch recipe by id. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}:
 *   put:
 *     summary: Replace an existing recipe by its ID.
 *     description: |
 *       Replace the existing recipe with the provided ID. The request body should contain the updated recipe data.
 *       If the recipe with the given ID does not exist, a 404 error is returned.
 *       All existing associations (ingredients, categories, subcategories, instructions, aliases, and images) are replaced with the new data.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the recipe to replace.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the recipe.
 *               description:
 *                 type: string
 *                 description: A detailed description of the recipe.
 *               nation:
 *                 type: string
 *                 description: The nation the recipe originates from.
 *               region:
 *                 type: string
 *                 description: The region the recipe is associated with.
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the ingredient.
 *                     quantity:
 *                       type: integer
 *                       description: The quantity of the ingredient.
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for the ingredient (e.g., grams, pieces).
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: A step-by-step list of instructions to prepare the recipe.
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Any alternative names or aliases for the recipe.
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Categories the recipe belongs to.
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Subcategories the recipe belongs to.
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the image.
 *                     type:
 *                       type: string
 *                       description: The type of the image (e.g., thumbnail, full-size).
 *                     caption:
 *                       type: string
 *                       description: A caption for the image.
 *               time:
 *                 type: integer
 *                 description: The preparation time in minutes.
 *               cost:
 *                 type: integer
 *                 description: The cost of the recipe.
 *     responses:
 *       200:
 *         description: The updated recipe data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                 name:
 *                   type: string
 *                   description: The name of the recipe.
 *                 description:
 *                   type: string
 *                   description: A brief description of the recipe.
 *                 nation:
 *                   type: string
 *                   description: The nation the recipe is associated with.
 *                 region:
 *                   type: string
 *                   description: The region the recipe is associated with.
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the ingredient.
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the ingredient.
 *                       unit:
 *                         type: string
 *                         description: The unit of measurement for the ingredient (e.g., grams, pieces).
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Step-by-step instructions to prepare the recipe.
 *                 time:
 *                   type: integer
 *                   description: The preparation time in minutes.
 *                 cost:
 *                   type: integer
 *                   description: The cost of the recipe in your currency.
 *       400:
 *         description: Invalid ID format or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message explaining what went wrong.
 *       404:
 *         description: Recipe not found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the given ID was not found.
 *       500:
 *         description: Internal server error while replacing the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: The technical error information.
 *     tags:
 *       - Recipes
 */
router.put('/:id', replaceRecipeById); // PUT /chop/api/recipes/{id}: Description: Replace recipe by id. Request body with updated recipe data.

/**
 * @swagger
 * /chop/api/recipes/{id}:
 *   patch:
 *     summary: Edit an existing recipe by its ID.
 *     description: |
 *       This endpoint allows you to edit an existing recipe by its unique ID. The request body can contain any subset of recipe fields. 
 *       Fields that are not provided will not be updated, and the original values will remain unchanged. 
 *       This is a partial update compared to a full replacement (PUT).
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the recipe to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the recipe (optional).
 *               description:
 *                 type: string
 *                 description: A detailed description of the recipe (optional).
 *               nation:
 *                 type: string
 *                 description: The nation the recipe originates from (optional).
 *               region:
 *                 type: string
 *                 description: The region the recipe is associated with (optional).
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The name of the ingredient (optional).
 *                     quantity:
 *                       type: integer
 *                       description: The quantity of the ingredient (optional).
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for the ingredient (optional).
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: A step-by-step list of instructions to prepare the recipe (optional).
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Any alternative names or aliases for the recipe (optional).
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Categories the recipe belongs to (optional).
 *               subcategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Subcategories the recipe belongs to (optional).
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: URL of the image (optional).
 *                     type:
 *                       type: string
 *                       description: The type of the image (e.g., thumbnail, full-size) (optional).
 *                     caption:
 *                       type: string
 *                       description: A caption for the image (optional).
 *               time:
 *                 type: integer
 *                 description: The preparation time in minutes (optional).
 *               cost:
 *                 type: integer
 *                 description: The cost of the recipe (optional).
 *     responses:
 *       200:
 *         description: The updated recipe data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                 name:
 *                   type: string
 *                   description: The name of the recipe.
 *                 description:
 *                   type: string
 *                   description: A brief description of the recipe.
 *                 nation:
 *                   type: string
 *                   description: The nation the recipe is associated with.
 *                 region:
 *                   type: string
 *                   description: The region the recipe is associated with.
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the ingredient.
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the ingredient.
 *                       unit:
 *                         type: string
 *                         description: The unit of measurement for the ingredient (e.g., grams, pieces).
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Step-by-step instructions to prepare the recipe.
 *                 time:
 *                   type: integer
 *                   description: The preparation time in minutes.
 *                 cost:
 *                   type: integer
 *                   description: The cost of the recipe in your currency.
 *       400:
 *         description: Invalid ID format or validation errors in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message explaining what went wrong.
 *       404:
 *         description: Recipe not found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the given ID was not found.
 *       500:
 *         description: Internal server error while updating the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: The technical error information.
 *     tags:
 *       - Recipes
 */
router.patch('/:id', updateRecipeById); // PATCH /chop/api/recipes/{id}: Description: Edit recipe by id. Request body with updated recipe data.

/**
 * @swagger
 * /chop/api/recipes/{name}:
 *   get:
 *     summary: Fetch all recipes with a given name (including aliases).
 *     description: |
 *       This endpoint allows users to search for recipes by their name or alias. The query supports various filters 
 *       such as category, subcategory, nation, region, preparation time, cost, sorting, and pagination. The search 
 *       is case-insensitive and can handle partial name matches.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: The name (or alias) of the recipe to search for.
 *         schema:
 *           type: string
 *           example: "spaghetti"
 *       - name: category
 *         in: query
 *         description: Filter recipes by category.
 *         schema:
 *           type: string
 *           example: "Italian"
 *       - name: subcategory
 *         in: query
 *         description: Filter recipes by subcategory.
 *         schema:
 *           type: string
 *           example: "pasta"
 *       - name: nation
 *         in: query
 *         description: Filter recipes by nation of origin.
 *         schema:
 *           type: string
 *           example: "Italy"
 *       - name: region
 *         in: query
 *         description: Filter recipes by region.
 *         schema:
 *           type: string
 *           example: "Tuscany"
 *       - name: time
 *         in: query
 *         description: Filter recipes by preparation time in minutes.
 *         schema:
 *           type: integer
 *           example: 30
 *       - name: cost
 *         in: query
 *         description: Filter recipes by cost.
 *         schema:
 *           type: integer
 *           example: 15
 *       - name: sort
 *         in: query
 *         description: Sort the results by a specific field.
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - time
 *             - cost
 *         example: "time"
 *       - name: limit
 *         in: query
 *         description: The number of results to return per page. Default is 10.
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: page
 *         in: query
 *         description: The page number for pagination. Default is 1.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: A paginated list of recipes matching the search criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalResults:
 *                   type: integer
 *                   description: Total number of matching recipes.
 *                   example: 50
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
 *                       nation:
 *                         type: string
 *                         description: The nation the recipe is associated with.
 *                       region:
 *                         type: string
 *                         description: The region the recipe is associated with.
 *                       time:
 *                         type: integer
 *                         description: The preparation time in minutes.
 *                       cost:
 *                         type: integer
 *                         description: The cost of the recipe in your currency.
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Categories the recipe belongs to.
 *                       subcategories:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Subcategories the recipe belongs to.
 *                       ingredients:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: A list of ingredients required for the recipe.
 *                       instructions:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: Step-by-step instructions for preparing the recipe.
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               description: The URL of the image.
 *                             type:
 *                               type: string
 *                               description: The type of image (e.g., thumbnail, full-size).
 *                             caption:
 *                               type: string
 *                               description: A caption describing the image.
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
 *                   description: A list of validation error messages for the query parameters.
 *       500:
 *         description: Internal server error while fetching recipes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: The technical error information.
 *     tags:
 *       - Recipes
 */
router.get('/:name', getAllRecipeWithName); // GET /chop/api/recipes/{name}: Description: Fetch all recipes with the given name(checks both Name and other names). Query parameters: Filter by category, sub_category, nation, region, time, cost, limit, page, sort.

/**
 * @swagger
 * /chop/api/recipes/{id}/names:
 *   get:
 *     summary: Fetch all available names (including aliases) for a recipe by ID.
 *     description: |
 *       This endpoint allows users to retrieve the primary name of a recipe along with any aliases (alternative names) 
 *       that are associated with that recipe. The recipe is identified by its unique ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe for which names are being fetched.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: A list of all names (including the primary name and aliases) associated with the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                   example: 1
 *                 names:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of names (the main name and any aliases) associated with the recipe.
 *                   example: 
 *                     - "Spaghetti"
 *                     - "Pasta al Pomodoro"
 *       404:
 *         description: Recipe with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the specified ID was not found.
 *                 error:
 *                   type: string
 *                   description: Detailed error message.
 *       500:
 *         description: Internal server error while fetching the recipe data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.get('/:id/names', getRecipeNamesById); // GET /chop/api/recipes/{id}/names: Description: Fetch all available names for a recipe. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/names:
 *   post:
 *     summary: Replace aliases for a specific recipe by its ID.
 *     description: |
 *       This endpoint allows users to replace the aliases (alternative names) associated with a recipe identified by its unique ID.
 *       The old aliases will be removed, and new aliases will be added as specified in the request body.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe for which aliases are being replaced.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of new aliases to be associated with the recipe.
 *                 example:
 *                   - "Spaghetti alla Pomodoro"
 *                   - "Tomato Spaghetti"
 *     responses:
 *       200:
 *         description: The recipe's aliases have been successfully replaced and the updated recipe is returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                   example: 1
 *                 names:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of names (including the main name and any aliases) associated with the recipe.
 *                   example: 
 *                     - "Spaghetti"
 *                     - "Spaghetti alla Pomodoro"
 *                     - "Tomato Spaghetti"
 *       400:
 *         description: Invalid recipe ID or invalid aliases format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe ID or aliases are invalid.
 *       404:
 *         description: Recipe with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the specified ID was not found.
 *       500:
 *         description: Internal server error while updating the aliases for the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.post('/:id/names', replaceAliasForRecipeById); // POST /chop/api/recipes/{id}/names: Description: REplace aliases for a recipe. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/names:
 *   put:
 *     summary: Add an additional alias for a specific recipe by its ID.
 *     description: |
 *       This endpoint allows users to add one or more new aliases (alternative names) to an existing recipe identified by its unique ID.
 *       The new aliases will be added to the recipe's current list of aliases.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe to which the alias will be added.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The list of new aliases to be added to the recipe.
 *                 example:
 *                   - "Spaghetti Bolognese"
 *                   - "Classic Spaghetti"
 *     responses:
 *       200:
 *         description: The recipe's aliases have been successfully updated, and the updated recipe is returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                   example: 1
 *                 names:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: A list of names (including the main name and any aliases) associated with the recipe.
 *                   example: 
 *                     - "Spaghetti"
 *                     - "Spaghetti Bolognese"
 *                     - "Classic Spaghetti"
 *       400:
 *         description: Invalid recipe ID or invalid aliases format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe ID or aliases are invalid.
 *       404:
 *         description: Recipe with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the specified ID was not found.
 *       500:
 *         description: Internal server error while adding the alias for the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.put('/:id/names', addAliasToRecipeById); // PUT /chop/api/recipes/{id}/names: Description: Add another alias for a recipe. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/ingredients:
 *   get:
 *     summary: Fetch the ingredients for a specific recipe by its ID.
 *     description: |
 *       This endpoint allows users to retrieve a list of ingredients associated with a recipe identified by its unique ID.
 *       The ingredients will include details such as name, quantity, and unit of measure.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe for which ingredients are being retrieved.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of ingredients for the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                   example: 1
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the ingredient.
 *                         example: 2
 *                       name:
 *                         type: string
 *                         description: The name of the ingredient.
 *                         example: "Tomato"
 *                       quantity:
 *                         type: number
 *                         description: The quantity of the ingredient required for the recipe.
 *                         example: 2
 *                       unit:
 *                         type: string
 *                         description: The unit of measurement for the ingredient (e.g., grams, cups, etc.).
 *                         example: "kg"
 *       400:
 *         description: Invalid recipe ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe ID is invalid.
 *       404:
 *         description: Recipe with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the specified ID was not found.
 *       500:
 *         description: Internal server error while fetching recipe ingredients.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.get('/:id/ingredients', getRecipeIngredientsById); // GET /chop/api/recipes/{id}/ingredients: Description: Fetch the ingredients for a recipe. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/ingredients:
 *   post:
 *     summary: Replace the ingredients for a specific recipe by its ID.
 *     description: |
 *       This endpoint allows users to replace all the ingredients for a recipe identified by its unique ID.
 *       The new ingredients must be provided in the request body. Any existing ingredients will be deleted.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe for which ingredients are being replaced.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique identifier of the ingredient.
 *                       example: 2
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the ingredient required for the recipe.
 *                       example: 2
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for the ingredient (e.g., grams, cups, etc.).
 *                       example: "kg"
 *     responses:
 *       200:
 *         description: Successfully replaced the ingredients for the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                   example: 1
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the ingredient.
 *                         example: 2
 *                       name:
 *                         type: string
 *                         description: The name of the ingredient.
 *                         example: "Tomato"
 *                       quantity:
 *                         type: number
 *                         description: The quantity of the ingredient required for the recipe.
 *                         example: 2
 *                       unit:
 *                         type: string
 *                         description: The unit of measurement for the ingredient (e.g., "kg").
 *                         example: "kg"
 *       400:
 *         description: Invalid recipe ID format or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error (e.g., "Invalid recipe ID" or "Missing required fields").
 *       404:
 *         description: Recipe with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the specified ID was not found.
 *       500:
 *         description: Internal server error while replacing ingredients.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.post('/:id/ingredients', replaceRecipeIngredientsById); // POST /chop/api/recipes/{id}/ingredients: Description: Replace the ingredients for a recipe. Request body with new ingredients.

/**
 * @swagger
 * /chop/api/recipes/{id}/ingredients:
 *   put:
 *     summary: Add a new ingredient to a specific recipe by its ID.
 *     description: |
 *       This endpoint allows users to add new ingredients to an existing recipe identified by its unique ID.
 *       The new ingredients must be provided in the request body. It only adds ingredients, it will not replace existing ones.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe to which the ingredient is being added.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The unique identifier of the ingredient.
 *                       example: 2
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the ingredient required for the recipe.
 *                       example: 2
 *                     unit:
 *                       type: string
 *                       description: The unit of measurement for the ingredient (e.g., grams, cups, etc.).
 *                       example: "kg"
 *     responses:
 *       200:
 *         description: Successfully added new ingredient(s) to the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique identifier of the recipe.
 *                   example: 1
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier of the ingredient.
 *                         example: 2
 *                       name:
 *                         type: string
 *                         description: The name of the ingredient.
 *                         example: "Tomato"
 *                       quantity:
 *                         type: number
 *                         description: The quantity of the ingredient required for the recipe.
 *                         example: 2
 *                       unit:
 *                         type: string
 *                         description: The unit of measurement for the ingredient (e.g., "kg").
 *                         example: "kg"
 *       400:
 *         description: Invalid recipe ID format or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error (e.g., "Invalid recipe ID" or "Missing required fields").
 *       404:
 *         description: Recipe with the provided ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe with the specified ID was not found.
 *       500:
 *         description: Internal server error while adding ingredients.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.put('/:id/ingredients', addRecipeIngredientsById); // PUT /chop/api/recipes/{id}/ingredients: Description: Add another ingredient for a recipe. Request body with new ingredients.


/**
 * @swagger
 * /chop/api/recipes/{id}/ingredients/{ingredient_id}:
 *   delete:
 *     summary: Remove an ingredient from a specific recipe by its ingredient ID.
 *     description: |
 *       This endpoint allows users to remove a specific ingredient from an existing recipe by its unique ingredient ID.
 *       The ingredient will be removed from the recipe identified by the `id` parameter.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe from which the ingredient will be removed.
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: ingredient_id
 *         in: path
 *         required: true
 *         description: The unique ID of the ingredient to be removed from the recipe.
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       204:
 *         description: Successfully removed the ingredient from the recipe.
 *       400:
 *         description: Invalid recipe ID or ingredient ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error (e.g., "Invalid recipe ID" or "Invalid ingredient ID").
 *       404:
 *         description: The specified ingredient was not found in the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the ingredient was not found for the specified recipe.
 *       500:
 *         description: Internal server error while removing the ingredient.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the server issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.delete('/:id/ingredients/:ingredient_id', removeRecipeIngredientByIdandIngredientId); // DELETE /chop/api/recipes/{id}/ingredients/{ingredient_id}: Description: Remove an ingredient for a recipe by ingredient id. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/instructions:
 *   get:
 *     summary: Fetch the instructions for a specific recipe.
 *     description: |
 *       This endpoint fetches the instructions for a recipe identified by the `id` parameter.
 *       It returns the steps and detailed instructions for preparing the recipe.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe whose instructions are to be fetched.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully fetched the recipe instructions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique ID of the recipe.
 *                 instructions:
 *                   type: array
 *                   description: The list of instructions for preparing the recipe.
 *                   items:
 *                     type: object
 *                     properties:
 *                       step:
 *                         type: integer
 *                         description: The step number in the instructions.
 *                         example: 1
 *                       instruction:
 *                         type: string
 *                         description: The detailed instruction for the recipe step.
 *                         example: "Preheat the oven to 350°F."
 *       400:
 *         description: Invalid recipe ID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the invalid input.
 *       404:
 *         description: The recipe with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe was not found.
 *       500:
 *         description: Internal server error while fetching the recipe instructions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.get('/:id/instructions', getRecipeInstructionsById); // GET /chop/api/recipes/{id}/instructions: Description: Fetch the instructions of a recipe. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/instructions:
 *   put:
 *     summary: Replace the instructions for a specific recipe.
 *     description: |
 *       This endpoint replaces the existing instructions of a recipe identified by the `id` parameter.
 *       The new instructions provided in the request body will replace the existing instructions entirely.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe whose instructions are to be replaced.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instructions:
 *                 type: array
 *                 description: The list of new instructions for the recipe.
 *                 items:
 *                   type: object
 *                   properties:
 *                     step:
 *                       type: integer
 *                       description: The step number in the instructions.
 *                       example: 1
 *                     instruction:
 *                       type: string
 *                       description: The detailed instruction for the recipe step.
 *                       example: "Preheat the oven to 350°F."
 *     responses:
 *       200:
 *         description: Successfully replaced the recipe instructions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique ID of the recipe.
 *                 instructions:
 *                   type: array
 *                   description: The updated list of instructions for preparing the recipe.
 *                   items:
 *                     type: object
 *                     properties:
 *                       step:
 *                         type: integer
 *                         description: The step number in the instructions.
 *                         example: 1
 *                       instruction:
 *                         type: string
 *                         description: The detailed instruction for the recipe step.
 *                         example: "Preheat the oven to 350°F."
 *       400:
 *         description: Invalid recipe ID or invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating invalid input.
 *       404:
 *         description: The recipe with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe was not found.
 *       500:
 *         description: Internal server error while replacing the recipe instructions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.put('/:id/instructions', replaceRecipeInstructionsById); // PUT /chop/api/recipes/{id}/instructions: Description: Replace the instructions of a recipe. Request body with new instructions data.

/**
 * @swagger
 * /chop/api/recipes/{id}/categories:
 *   get:
 *     summary: Fetch all categories for a specific recipe.
 *     description: |
 *       This endpoint fetches all the categories associated with a recipe identified by the `id` parameter.
 *       The response will return the list of categories that the recipe belongs to.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe whose categories are to be fetched.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully fetched the categories for the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique ID of the recipe.
 *                 categories:
 *                   type: array
 *                   description: The list of categories associated with the recipe.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique ID of the category.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the category.
 *                         example: "Dessert"
 *       400:
 *         description: Invalid recipe ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating invalid input.
 *       404:
 *         description: The recipe with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe was not found.
 *       500:
 *         description: Internal server error while fetching the recipe categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.get('/:id/categories', getRecipeCategoriesById); // GET /chop/api/recipes/{id}/categories: Description: Fetch all categories for a recipe. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/categories:
 *   put:
 *     summary: Add new categories to a specific recipe.
 *     description: |
 *       This endpoint allows adding additional categories to a recipe identified by the `id` parameter.
 *       The request body should include the list of categories to be added to the recipe.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe to which the categories will be added.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 description: List of categories to be added to the recipe.
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the category to be added.
 *                       example: 3
 *     responses:
 *       200:
 *         description: Successfully added the new categories to the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The unique ID of the recipe.
 *                 categories:
 *                   type: array
 *                   description: The updated list of categories for the recipe.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the category.
 *                         example: 3
 *                       name:
 *                         type: string
 *                         description: The name of the category.
 *                         example: "Vegetarian"
 *       400:
 *         description: Invalid recipe ID or invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating what was wrong with the request.
 *       404:
 *         description: The recipe with the specified ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the recipe was not found.
 *       500:
 *         description: Internal server error while adding categories to the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.put('/:id/categories', addRecipeCategoriesById); // PUT /chop/api/recipes/{id}/categories: Description: Add more categories for a recipe. No query parameters.

/**
 * @swagger
 * /chop/api/recipes/{id}/categories/{category_id}:
 *   delete:
 *     summary: Remove a category from a specific recipe.
 *     description: |
 *       This endpoint allows removing a category from a recipe identified by the `id` parameter and the `category_id` path parameter.
 *       The request deletes the relationship between the recipe and the category.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the recipe from which the category will be removed.
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: category_id
 *         in: path
 *         required: true
 *         description: The unique ID of the category to be removed from the recipe.
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       204:
 *         description: Successfully removed the category from the recipe.
 *       400:
 *         description: Invalid recipe ID or category ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating what was wrong with the request.
 *       404:
 *         description: The specified recipe or category was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the category or recipe was not found.
 *       500:
 *         description: Internal server error while removing the category from the recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 *                 error:
 *                   type: string
 *                   description: Detailed error information.
 *     tags:
 *       - Recipes
 */
router.delete('/:id/categories/:category_id', removeRecipeCategoryByIdandCategoryId); // DELETE /chop/api/recipes/{id}/categories/{category_id}: Description: Remove category from recipe by category id. No query parameters.


router.get('/:id/subcategories', getRecipeSubcategoriesById);// GET /chop/api/recipes/{id}/subcategories: Description: Fetch all subcategories for a recipe. No query parameters.


router.put('/:id/subcategories', addRecipeSubcategoriesById);// PUT /chop/api/recipes/{id}/subcategories: Description: Add more subcategories for a recipe. No query parameters.
router.delete('/:id/subcategories/:subcategory_id', removeRecipeSubcategoriesByIdandSubcategoryId); // DELETE /chop/api/recipes/{id}/subcategories/{subcategory_id}: Description: Remove subcategory from recipe by subcategory id. No query parameters.

router.get('/:id/images', getRecipeImagesById); // GET /chop/api/recipes/{id}/images: Description: Fetch all available images for a recipe. Query parameters: limit.
router.post('/:id/images', addRecipeImageById); // POST /chop/api/recipes/{id}/images: Description: Add new image for a recipe. Request body with image data.
router.delete('/:id/images/:image_id', removeRecipeImageByIdandImageId); // DELETE /chop/api/recipes/{id}/images/{image_id}: Description: Remove image from recipe by image id. No query parameters.

export default router;

