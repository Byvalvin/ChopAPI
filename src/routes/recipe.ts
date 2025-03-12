import { Router } from 'express';
import {
    addRecipe, addAliasToRecipeById, addRecipeIngredientsById, addRecipeCategoriesById, addRecipeSubcategoriesById, addRecipeImageById,
    updateRecipeById,
    getAllRecipes, getRecipeById, getAllRecipeWithName,
    getRecipeNamesById, getRecipeIngredientsById, getRecipeInstructionsById, getRecipeCategoriesById, getRecipeSubcategoriesById, getRecipeImagesById,
    replaceRecipeById, replaceAliasForRecipeById, replaceRecipeIngredientsById, replaceRecipeInstructionsById,
    removeRecipeIngredientByIdandIngredientId, removeRecipeCategoryByIdandCategoryId, removeRecipeSubcategoriesByIdandSubcategoryId, removeRecipeImageByIdandImageId,
    
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
 *                       ingredients:
 *                         type: array
 *                         items:
 *                           type: string
 *                           description: List of ingredients for the recipe.
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
router.post('/', addRecipe); // POST /chop/api/recipes: Description: Add a new recipe. Request body with new recipe data.

router.get('/:id', getRecipeById); // GET /chop/api/recipes/{id}: Description: Fetch recipe by id. No query parameters.
router.put('/:id', replaceRecipeById); // PUT /chop/api/recipes/{id}: Description: Replace recipe by id. Request body with updated recipe data.
router.patch('/:id', updateRecipeById); // PATCH /chop/api/recipes/{id}: Description: Edit recipe by id. Request body with updated recipe data.

router.get('/:name', getAllRecipeWithName); // GET /chop/api/recipes/{name}: Description: Fetch all recipes with the given name(checks both Name and other names). Query parameters: Filter by category, sub_category, nation, region, time, cost, limit, page, sort.
router.get('/:id/names', getRecipeNamesById); // GET /chop/api/recipes/{id}/names: Description: Fetch all available names for a recipe. No query parameters.
router.post('/:id/names', replaceAliasForRecipeById); // POST /chop/api/recipes/{id}/names: Description: REplace aliases for a recipe. No query parameters.
router.put('/:id/names', addAliasToRecipeById); // PUT /chop/api/recipes/{id}/names: Description: Add another alias for a recipe. No query parameters.

router.get('/:id/ingredients', getRecipeIngredientsById); // GET /chop/api/recipes/{id}/ingredients: Description: Fetch the ingredients for a recipe. No query parameters.
router.post('/:id/ingredients', replaceRecipeIngredientsById); // POST /chop/api/recipes/{id}/ingredients: Description: Replace the ingredients for a recipe. Request body with new ingredients.
router.put('/:id/ingredients', addRecipeIngredientsById); // PUT /chop/api/recipes/{id}/ingredients: Description: Add another ingredient for a recipe. Request body with new ingredients.
router.delete('/:id/ingredients/:ingredient_id', removeRecipeIngredientByIdandIngredientId); // DELETE /chop/api/recipes/{id}/ingredients/{ingredient_id}: Description: Remove an ingredient for a recipe by ingredient id. No query parameters.

router.get('/:id/instructions', getRecipeInstructionsById); // GET /chop/api/recipes/{id}/instructions: Description: Fetch the instructions of a recipe. No query parameters.
router.put('/:id/instructions', replaceRecipeInstructionsById); // PUT /chop/api/recipes/{id}/instructions: Description: Replace the instructions of a recipe. Request body with new instructions data.

router.get('/:id/categories', getRecipeCategoriesById); // GET /chop/api/recipes/{id}/categories: Description: Fetch all categories for a recipe. No query parameters.
router.put('/:id/categories', addRecipeCategoriesById); // PUT /chop/api/recipes/{id}/categories: Description: Add more categories for a recipe. No query parameters.
router.delete('/:id/categories/:category_id', removeRecipeCategoryByIdandCategoryId); // DELETE /chop/api/recipes/{id}/categories/{category_id}: Description: Remove category from recipe by category id. No query parameters.

router.get('/:id/subcategories', getRecipeSubcategoriesById);// GET /chop/api/recipes/{id}/subcategories: Description: Fetch all subcategories for a recipe. No query parameters.
router.put('/:id/subcategories', addRecipeSubcategoriesById);// PUT /chop/api/recipes/{id}/subcategories: Description: Add more subcategories for a recipe. No query parameters.
router.delete('/:id/subcategories/:subcategory_id', removeRecipeSubcategoriesByIdandSubcategoryId); // DELETE /chop/api/recipes/{id}/subcategories/{subcategory_id}: Description: Remove subcategory from recipe by subcategory id. No query parameters.

router.get('/:id/images', getRecipeImagesById); // GET /chop/api/recipes/{id}/images: Description: Fetch all available images for a recipe. Query parameters: limit.
router.post('/:id/images', addRecipeImageById); // POST /chop/api/recipes/{id}/images: Description: Add new image for a recipe. Request body with image data.
router.delete('/:id/images/:image_id', removeRecipeImageByIdandImageId); // DELETE /chop/api/recipes/{id}/images/{image_id}: Description: Remove image from recipe by image id. No query parameters.

export default router;


