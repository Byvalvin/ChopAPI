import { Router } from "express";

import { getAllIngredients, getRecipeThatUseIngredientByName } from '../controllers/ingredientController';


const router = Router();

// ROUTES
router.get('/', getAllIngredients); // GET /chop/api/ingredients: Description: Fetch all available ingredients. Query parameters: sort, limit, page, search.

router.get('/:ingredient_name/recipes', getRecipeThatUseIngredientByName); // GET /chop/api/ingredients/{ingredient_name}/recipes: Description: Fetch all available recipes that require a specific ingredient. Query parameters: Filter by category, sub_category, nation, region, time, cost, sort, limit, page, 	search, amount, unit.

// router.get('/:ingredient_id/recipes', getRecipesThatUseIngredientById); //     GET /chop/api/ingredients/{id}/recipes: Description: Fetch all available recipes that require a specific ingredient by id. Query parameters: Filter by category, sub_category, nation, region, time, cost, sort, limit, page, search, amount, unit.

export default router;