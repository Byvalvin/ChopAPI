import { Request, Response } from 'express';
import { Ingredient as IngredientI } from '../interface';  // Assuming the interface exists
import { generateRecipeFilterConditions, getRecipeDetails, stdInclude, validateQueryParams, validSortFields } from './controllerHelpers/recipeControllerHelpers';
import { generateIngredientFilterConditions } from './controllerHelpers/ingredientControllerHelpers';
import Ingredient from '../models/Ingredient';
import Recipe from '../models/Recipe';
import { Op } from 'sequelize';
import { normalizeString } from '../utils';

// Dummy data for ingredients
let ingredientDB: IngredientI[] = [
    { id: 1, name: 'Tomato' },
    { id: 2, name: 'Garlic' },
    { id: 3, name: 'Onion' },
    { id: 4, name: 'Olive Oil' },
    { id: 5, name: 'Basil' },
    { id: 6, name: 'Salt' },
];


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

        const rows = await Ingredient.findAll({ // Fetching recipe IDs based on dynamic conditions
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

        // Step 4: Return paginated results with detailed recipes
        res.status(200).json({
            totalResults: rows.length,
            results: rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredients from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};



// Get Ingredients with a given name
export const getRecipeThatUseIngredientByName = async (req: Request, res: Response) => { // NEED TO FIX TO LOOK AT INGREDIENT NAMES AND NOT RECIPE NAMES
    const { ingredient_name } = req.params; // Step 1: get user input. Extract the name from the request params
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
        res.status(400).json({ errors: errors });
        return;
    }
    let { category, subcategory, nation, region, time, cost, sort, limit = 10, page = 1} = queryParams; 
            
    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Apply sorting
    let order: any = [];
    if (sort) {
        order = [[sort, 'ASC']];
    } else {
        // Default sorting by name if no sort is provided
        order = [['name', 'ASC']];
    }
    const normalizedSearchTerm = normalizeString(ingredient_name); // Normalize the name parameter from the request

    // Step 3: Fulfil Request
    try {
        const { whereConditions, includeConditions } = generateRecipeFilterConditions(queryParams); // Generate the where conditions using the helper function (filters based on category, subcategory, etc.)
        whereConditions.name = { [Op.iLike]: `%${normalizedSearchTerm}%` }; // Apply name filter to the whereConditions, Match the recipe name

        const rows  = await Recipe.findAll({ // Sequelize query to fetch the filtered and sorted recipes with the required associations
            where: whereConditions, // Apply where conditions for filtering
            include: includeConditions.length ? includeConditions : stdInclude, // Apply include conditions for associations
            limit,
            offset: (page - 1) * limit,
            order: order, // Apply ordering
        });
        
        if (!rows.length) { // If no recipes are found, return an empty result
            res.status(200).json({
                totalResults: 0,
                results: []
            });
            return;
        }

        const detailedRecipes = await Promise.all( // Fetch detailed recipe data using the getRecipeDetails function
            rows.map(async (recipe) => await getRecipeDetails(recipe.id)) // Fetch detailed info for each recipe
        );

        // Step 4: Return the paginated results with detailed recipe data
        res.status(200).json({
            totalResults: detailedRecipes.length,
            results: detailedRecipes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching recipes with name ${ingredient_name} from the database`, error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};