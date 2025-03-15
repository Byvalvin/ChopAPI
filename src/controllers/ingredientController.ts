import { NextFunction, Request, Response } from 'express';
import { generateRecipeFilterConditions, getRecipeDetails, validSortFields } from './controllerHelpers/recipeControllerHelpers';
import { generateIngredientFilterConditions } from './controllerHelpers/ingredientControllerHelpers';
import Ingredient from '../models/Ingredient';
import Recipe from '../models/Recipe';
import { Op } from 'sequelize';
import { normalizeString, validateQueryParams } from '../utils';


// Controller function for getting all ingredients
export const getAllIngredients = async(req: Request, res: Response) => {
    // Step 1: get user input
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
        res.status(400).json({ errors: errors });
        return;
    }
    let { sort = 'name', limit = 10, page = 1, search = '' } = queryParams;

    // Parse limit and page to integers
    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Handle sort parameter
    let order: any = [];
    // Check if sort is a string and if it's valid
    if (typeof sort === 'string' && validSortFields.includes(sort)) {
        order = [[sort, 'ASC']];
    } else if (sort) {
        // If sort is not a valid string, you can choose to either:
        // - Ignore sorting (i.e., pass an empty array)
        // - Use a default sort, for example by name (you can change this to your default)
        order = [['name', 'ASC']];
    }

    // Step 3: Fulfil Request
    try { // Sequelize findAll query with dynamic conditions and sorting
        const { whereConditions, includeConditions } = generateIngredientFilterConditions(req.query); // Generate the where and include conditions using the helper function

        const rows = await Ingredient.findAll({ // Fetching ingredients based on dynamic conditions
            where: whereConditions, // Apply where conditions
            include: includeConditions, // Apply include conditions (associations)
            limit,
            offset: (page - 1) * limit,
            order,  // Pass the order here
        });

        // If no results are found
        if (!rows.length) {
            res.status(200).json({
                totalResults: 0,
                results: [],
            });
            return;
        }

        // Step 4: Return paginated results
        res.status(200).json({
            totalResults: rows.length,
            results: rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredients from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};



// Get Recipes using a given ingredient name
export const getRecipeThatUseIngredientByName = async (req: Request, res: Response) => {
    const { ingredient_name } = req.params; // Extract ingredient name from URL parameter
    const { isValid, queryParams, errors } = validateQueryParams(req); // Validate query parameters

    // Step 2: Validate and parse query params
    if (!isValid) {
        res.status(400).json({ errors: errors });
        return;
    }
    
    let { sort, limit = 10, page = 1 } = queryParams;
    
    // Validate limit and page to ensure they're reasonable
    limit = Math.max(1, Math.min(Number(limit), 100)); // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Apply sorting
    let order: any = [];
    if (sort) {
        order = [[sort, 'ASC']];
    } else {
        order = [['name', 'ASC']]; // Default sorting by recipe name
    }

    const normalizedSearchTerm = normalizeString(ingredient_name); // Normalize the search term for consistency

    // Step 3: Fulfill the request and query the database
    try {
        const { whereConditions, includeConditions } = generateRecipeFilterConditions(queryParams); // Generate filter conditions

        // Fetch recipes using Sequelize's `include` to join with Ingredients
        const rows = await Recipe.findAll({
            where: whereConditions, // Filtering recipes by conditions
            include: [
                ...includeConditions,  // Include any other conditions you might need
                {
                    model: Ingredient,
                    through: { attributes: ['quantity','unit'] },
                    where: { name: { [Op.iLike]: `%${normalizedSearchTerm}%` } }, // Join with ingredients based on name
                    required: true, // Ensures we only get recipes that include this ingredient
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: order, // Sorting based on user input
        });

        if (!rows.length) {
            res.status(200).json({
                totalResults: 0,
                results: []
            });
            return;
        }

        // Step 4: Fetch detailed recipe data
        const detailedRecipes = await Promise.all(
            rows.map(async (recipe) => await getRecipeDetails(recipe.id)) // Fetch detailed info for each recipe
        );

        res.status(200).json({
            totalResults: detailedRecipes.length,
            results: detailedRecipes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching recipes with ingredient ${ingredient_name}`, error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Get recipes using given ingredient id
export const getRecipesThatUseIngredientById = async (req:Request, res:Response, next:NextFunction) => {
    const { ingredient_id } = req.params; // Extract ingredient name from URL parameter
    const { isValid, queryParams, errors } = validateQueryParams(req); // Validate query parameters

    // Step 2: Validate and parse query params
    if(isNaN(Number(ingredient_id))){
        return next();
    }
    if (!isValid) {
        res.status(400).json({ errors: errors });
        return;
    }
    const ingredientId = parseInt(ingredient_id, 10);
    let { sort, limit = 10, page = 1 } = queryParams;
    
    // Validate limit and page to ensure they're reasonable
    limit = Math.max(1, Math.min(Number(limit), 100)); // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Apply sorting
    let order: any = [];
    if (sort) {
        order = [[sort, 'ASC']];
    } else {
        order = [['name', 'ASC']]; // Default sorting by recipe name
    }
    // Step 3: Fulfill the request and query the database
    try {
        const { whereConditions, includeConditions } = generateRecipeFilterConditions(queryParams); // Generate filter conditions

        // Fetch recipes using Sequelize's `include` to join with Ingredients
        const rows = await Recipe.findAll({
            where: whereConditions, // Filtering recipes by conditions
            include: [
                ...includeConditions,  // Include any other conditions you might need
                {
                    model: Ingredient,
                    through: { attributes: ['quantity','unit'] },
                    where: { id: ingredientId }, // Join with ingredients based on name
                    required: true, // Ensures we only get recipes that include this ingredient
                },
            ],
            limit,
            offset: (page - 1) * limit,
            order: order, // Sorting based on user input
        });

        if (!rows.length) {
            res.status(200).json({
                totalResults: 0,
                results: []
            });
            return;
        }

        // Step 4: Fetch detailed recipe data
        const detailedRecipes = await Promise.all(
            rows.map(async (recipe) => await getRecipeDetails(recipe.id)) // Fetch detailed info for each recipe
        );

        res.status(200).json({
            totalResults: detailedRecipes.length,
            results: detailedRecipes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching recipes with ingredient id ${ingredient_id}`, error: `${(error as Error).name}: ${(error as Error).message}` });
    }
    
}