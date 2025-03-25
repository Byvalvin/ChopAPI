import { NextFunction, Request,Response  } from 'express';
import { Op, Includeable, Transaction } from 'sequelize';

import { normalizeString, validateQueryParams } from '../utils';
import { Image } from '../interface';

import Recipe from '../models/Recipe';  // Import the Recipe model
import Ingredient from '../models/Ingredient';
import RecipeIngredient from '../models/RecipeIngredient';
import Category from '../models/Category';
import Subcategory from '../models/Subcategory';
import RecipeCategory from '../models/RecipeCategory';
import RecipeSubcategory from '../models/RecipeSubcategory';
import RecipeInstruction from '../models/RecipeInstruction';
import RecipeAlias from '../models/RecipeAlias';
import RecipeImage from '../models/RecipeImage';

import {
    validSortFields, stdInclude, 
    getRecipeDetails, generateRecipeFilterConditions,
    handleCategories, handleIngredients, handleRecipeAliases, handleRecipeImages, handleRecipeInstructions, handleRegionAndNation, handleSubcategories,
    validateRecipeData,
} from './controllerHelpers/recipeControllerHelpers'

import RecipeCache from '../caching/RecipeCaching';
import RegionCache from '../caching/RegionCaching';
import sequelize from '../DB/connection';
import { regions } from '../data';

export const deleteRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const recipeId = parseInt(id, 10);  // Step 2: validate and parse user input, return if bad input. Convert ID to an integer
    if (isNaN(recipeId)) {  
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }

    const t = await sequelize.transaction();  // Start a new transaction
    try {
        const recipe = await Recipe.findOne({ where: { id: recipeId }, transaction: t });
        if (!recipe) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }

        // Delete related entries first if cascading doesn't work automatically
        await RecipeAlias.destroy({ where: { recipeId }, transaction: t });
        await RecipeInstruction.destroy({ where: { recipeId }, transaction: t });
        await RecipeImage.destroy({ where: { recipeId }, transaction: t });
        await RecipeCategory.destroy({ where: { recipeId }, transaction: t });
        await RecipeSubcategory.destroy({ where: { recipeId }, transaction: t });
        await RecipeIngredient.destroy({ where: { recipeId }, transaction: t });

        // Now delete the recipe
        await recipe.destroy({ transaction: t });

        await t.commit();  // Commit the transaction
        await RecipeCache.invalidateCache(recipeId);
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        await t.rollback();  // Rollback the transaction in case of error
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Main endpoint to get all recipes
export const getAllRecipes = async (req: Request, res: Response) => {
    // Step 1: get user input
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
      res.status(400).json({ errors: errors });
      return;
    }
    let { category, subcategory, nation, region, time, cost, sort, limit = 10, page = 1, search } = queryParams; 
    
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
        const { whereConditions, includeConditions } = generateRecipeFilterConditions(queryParams); // Generate the where and include conditions using the helper function

        const rows = await Recipe.findAll({ // Fetching recipe IDs based on dynamic conditions
            where: whereConditions, // Apply where conditions
            include: includeConditions, // Apply include conditions (associations)
            limit: Number(limit),
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

        // Now use `getRecipeDetails` to fetch details for each recipe
        const detailedRecipes = [];
        // Loop through each recipe to fetch detailed data
        for (const recipe of rows) {
            const detailedRecipe = await getRecipeDetails(recipe.id);  // Get full details using the existing function
            if (detailedRecipe) { detailedRecipes.push(detailedRecipe); }
        }

        // Step 4: Return paginated results with detailed recipes
        res.status(200).json({
            totalResults: detailedRecipes.length,
            results: detailedRecipes,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipes from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};


// Add A New Recipe
export const addRecipe = async (req: Request, res: Response) => {
    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Step 1: get user input

    // Step 2: validate and parse user input, return if bad input
    // Validate required fields
    if (!(name && description && nation && region && ingredients && instructions && time !== undefined)) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }
    
    // Step 3: Fulfil Request
    const transaction: Transaction = await sequelize.transaction();
    try {
        const { regionId, nationId } = await handleRegionAndNation(region, nation, transaction); // Handle Region and Nation
        // Step 3: Create the new Recipe
        const newRecipe = await Recipe.create({
            name,
            description,
            nationId,
            regionId,
            time,
            cost: cost || 0
        }, { transaction });

        // Step 4: Handle Ingredients
        await handleIngredients(newRecipe.id, ingredients, transaction);

        // Step 5: Handle Categories and Subcategories
        if (categories) await handleCategories(newRecipe.id, categories, transaction);
        if (subcategories) await handleSubcategories(newRecipe.id, subcategories, transaction);

        // Step 6: Handle Recipe Instructions, Aliases, and Images
        await handleRecipeInstructions(newRecipe.id, instructions, transaction);
        await handleRecipeAliases(newRecipe.id, aliases, transaction);
        await handleRecipeImages(newRecipe.id, images, transaction);

        // Step 7: Commit the transaction
        await transaction.commit();

        // Invalidate cache after commit
        await RecipeCache.invalidateCache(newRecipe.id);
        await RegionCache.invalidateCache(regionId);

        // Return response with the new recipe's ID
        res.status(201).json({ message: `Recipe added with ID: ${newRecipe.id}` });

    } catch (error) {
        // Step 8: Rollback the transaction in case of an error
        await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error adding recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Get Recipe by ID
export const getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Step 1: get user input. Extract the recipe ID from the request parameters

    if (isNaN(Number(id))) {  // Check if the ID is a valid number (ID should be numeric)
        return next();  // If it's not a number, pass to the next route handler
    }

    const recipeId = parseInt(id, 10);  // Step 2: validate and parse user input, return if bad input. Convert ID to an integer
    if (isNaN(recipeId)) {  
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }

    // Step 3: Fulfil Request
    try {
        // Use getRecipeDetails to fetch the recipe details by ID
        const recipe = await getRecipeDetails(recipeId);
        if (!recipe) {
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Step 4: Return the recipe details with status 200
        res.status(200).json(recipe);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe details', error:`${(error as Error).name}: ${(error as Error).message}` });
        return;
    }
};

// Replace the old recipe at id with a new one at id
export const replaceRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input
    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Get user data from the request body

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }
    if (!(name && description && nation && ingredients && instructions && time !== undefined)) { // Basic validation of required fields
        res.status(400).json({ message: "Missing required fields: name, description, nation, ingredients, instructions, and time are required." });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }
    
    // Step 3: Fulfil Request
    const transaction = await sequelize.transaction(); // Start a new transaction
    try {
        // Find the recipe in the database
        const recipe = await Recipe.findOne({
            where: { id: recipeId },
            include: stdInclude,
            transaction, // Pass transaction here to ensure the query is part of the transaction
        });

        if (!recipe) {
            await transaction?.rollback(); // Rollback transaction if the recipe isn't found
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Start deleting existing associations within the transaction
        await RecipeIngredient.destroy({ where: { recipeId }, transaction });
        await RecipeCategory.destroy({ where: { recipeId }, transaction });
        await RecipeSubcategory.destroy({ where: { recipeId }, transaction });
        await RecipeAlias.destroy({ where: { recipeId }, transaction });
        await RecipeImage.destroy({ where: { recipeId }, transaction });
        await RecipeInstruction.destroy({ where: { recipeId }, transaction });


        // Handle ingredients, categories, subcategories, instructions, aliases, and images updates in the transaction
        await handleIngredients(recipe.id, ingredients, transaction); 
        await handleCategories(recipe.id, categories as string[], transaction); 
        await handleSubcategories(recipe.id, subcategories as string[], transaction);
        await handleRecipeInstructions(recipe.id, instructions as string[], transaction); 
        await handleRecipeAliases(recipe.id, aliases as string[], transaction); 
        await handleRecipeImages(recipe.id, images as Image[], transaction);

        // Update the recipe fields in the database, also part of the transaction
        // Handle region and nation, including transaction
        const { regionId, nationId } = await handleRegionAndNation(region, nation, transaction); 
        await recipe.update({
            name,
            description,
            nation,
            regionId,
            nationId,
            time,
            cost: cost || 0,
        }, { transaction });

        // Commit the transaction if all operations succeed
        await transaction?.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);
        await RegionCache.invalidateCache(regionId);

        // Return the updated recipe data
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        if (transaction) {
            await transaction.rollback(); // If anything goes wrong, rollback the transaction
        }
        console.error(error);
        res.status(500).json({ message: 'Error replacing recipe data', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Update Recipe by Id
export const updateRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input
    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Extract the recipe data from the request body

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Step 3: Fulfil Request
    const transaction = await sequelize.transaction(); // Start a new transaction
    try {
        const recipe = await Recipe.findOne({ // Find the recipe in the database
            where: { id: recipeId },
            include: stdInclude,
            transaction, // Pass transaction to ensure the query is part of the transaction
        });
        if (!recipe) {
            await transaction.rollback(); // Rollback if recipe not found
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        const updatedFields = { // Handle fields that are passed in the request
            name: name || recipe.name,
            description: description || recipe.description,
            time: time || recipe.time,
            cost: cost !== undefined ? cost : recipe.cost, // Ensure cost is only updated if provided
        };

        // Handle updates for relational data (ingredients, categories, subcategories, etc.)
        if (ingredients) await handleIngredients(recipeId, ingredients, transaction);
        if (categories) await handleCategories(recipeId, categories, transaction);
        if (subcategories) await handleSubcategories(recipeId, subcategories, transaction);
        if (instructions) await handleRecipeInstructions(recipeId, instructions, transaction);
        if (aliases) await handleRecipeAliases(recipeId, aliases, transaction);
        if (images) await handleRecipeImages(recipeId, images, transaction);

        // Handle the region and nation update (inside transaction)
        const { regionId, nationId } = await handleRegionAndNation(region, nation, transaction);
        // Now update the recipe fields in the database (inside transaction)
        await recipe.update({
            ...updatedFields, // Spread the updated fields
            regionId,  // Update regionId after resolving region
            nationId,  // Update nationId after resolving nation
        }, { transaction });

        // Commit the transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);
        await RegionCache.invalidateCache(regionId);

        // Step 4: Return the updated recipe details
        const updatedRecipe = await getRecipeDetails(recipeId);
        res.status(200).json(updatedRecipe);
    } catch (error) {
        // If an error occurs, rollback the transaction
        if (transaction) {
            await transaction.rollback();
        }
        console.error(error);
        res.status(500).json({ message: 'Error updating recipe data', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};


// Get Recipes with a given name
export const getAllRecipeWithName = async (req: Request, res: Response) => {
    const { name } = req.params; // Step 1: get user input. Extract the name from the request params
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
    const normalizedSearchTerm = normalizeString(name); // Normalize the name parameter from the request

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
        res.status(500).json({ message: `Error fetching recipes with name ${name} from the database`, error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};


// Get Names/Aliases for a Recipe
export const getRecipeNamesById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input

    // Step 3: Fulfil Request
    try {
        // Fetch the recipe by its ID along with its aliases using Sequelize
        const include : Includeable[] = [
            { model: RecipeAlias, attributes: ['alias'] }
        ]
        const recipe = await getRecipeDetails(recipeId, include);
        if (!recipe) {
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        const names = [recipe.name, ...(recipe.aliases || [])]; // Collect the recipe name and its aliases (if any)

        // Step 4: Return the recipe name(s) (OR FAILURE) message
        res.status(200).json({
            id: recipeId,
            names: names
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
        return;
    }
};


// Replace aliases for a specific Recipe
export const replaceAliasForRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params; // Recipe ID from params
    const { aliases } = req.body; // New aliases from request body
  
    const recipeId = parseInt(id, 10); // Ensure recipeId is an integer
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // Return error if validation fails
        return;
    }


    // Step 3: Fulfill request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Step 1: Delete existing aliases for the recipe (inside transaction)
        await RecipeAlias.destroy({
            where: { recipeId },
            transaction, // Pass the transaction
        });
        // Step 2: Handle adding new aliases (inside transaction)
        await handleRecipeAliases(recipeId, aliases, transaction);

        // Commit transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Return the updated recipe
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // If an error occurs, rollback the transaction
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error replacing aliases for recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Add a new alias for a specific Recipe
export const addAliasToRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params; // Recipe ID from params
    const { aliases } = req.body; // New aliases from request body
  
    // Ensure recipeId is an integer
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // Return error if validation fails
        return;
    }

    // Step 3: Fulfill request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Step 1: Handle adding new aliases (inside transaction)
        await handleRecipeAliases(recipeId, aliases, transaction);

        // Commit transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Return the updated recipe along with new aliases
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // If an error occurs, rollback the transaction
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error adding alias to recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Get Ingredients for a specific Recipe
export const getRecipeIngredientsById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input. Recipe ID from request params

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    // Step 3: Fulfil Request
    try {
        const include : Includeable[] = [{ // Fetch the recipe by its ID and include associated ingredients
            model: Ingredient,
            attributes: ['id', 'name'], // You can add more fields if needed
            through: { attributes: ['quantity','unit'] }, 
        }];
        const recipe = await getRecipeDetails(recipeId, include);
        if (!recipe) { // If the recipe is not found, return a 404 error
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }
    
        // Step 4: Return the recipe's ingredients (OR FAILURE) message
        res.status(200).json({
            id: recipeId,
            ingredients: recipe.ingredients, // The ingredients associated with the recipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe ingredients from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Replace Ingredients for a specific Recipe
export const replaceRecipeIngredientsById = async (req: Request, res: Response) => {
    const { id } = req.params; // Get user input
    const { ingredients } = req.body;

    const recipeId = parseInt(id, 10); // Validate and parse user input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Fulfill Request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Step 1: Delete existing ingredients for the recipe (inside transaction)
        await RecipeIngredient.destroy({
            where: { recipeId },
            transaction, // Pass the transaction
        });

        // Step 2: Handle adding new ingredients (inside transaction)
        await handleIngredients(recipeId, ingredients, transaction);

        // Commit transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Return the updated recipe
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error replacing ingredients for recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
}

// Add new Ingredients for a specific Recipe
export const addRecipeIngredientsById = async (req: Request, res: Response) => {
    const { id } = req.params; // Get user input
    const { ingredients } = req.body;

    const recipeId = parseInt(id, 10); // Validate and parse user input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Fulfill Request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Step 1: Handle adding new ingredients (inside transaction)
        await handleIngredients(recipeId, ingredients, transaction);

        // Commit transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Return the updated recipe
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error adding ingredient to recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};


// Remove a Recipe Ingredient by Id with Ingredient Id
export const removeRecipeIngredientByIdandIngredientId = async (req: Request, res: Response) => {
    const { id, ingredient_id } = req.params; // Get user input

    const recipeId = parseInt(id, 10); // Validate and parse user input
    const ingredientId = parseInt(ingredient_id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    if (isNaN(ingredientId)) {
        res.status(400).json({ message: 'Invalid ingredient ID' });
        return;
    }

    // Fulfill Request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Step 1: Check if the ingredient exists for the recipe
        const ingredientExists = await RecipeIngredient.findOne({
            where: { recipeId, ingredientId },
            transaction, // Pass the transaction
        });
        if (!ingredientExists) {
            res.status(404).json({
                message: `Ingredient with ID ${ingredientId} not found for recipe with ID ${recipeId}`,
            });
            return;
        }

        // Step 2: Delete the ingredient (inside transaction)
        await RecipeIngredient.destroy({
            where: { recipeId, ingredientId },
            transaction, // Pass the transaction
        });

        // Commit transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Return the success message
        res.status(204).json({
            message: `Deleted Ingredient with id ${ingredientId} from recipe with id ${recipeId}`,
        });
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error removing ingredient for recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Get the Instructions for a Recipe
export const getRecipeInstructionsById = async (req:Request, res:Response) => {
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    try {
        const include : Includeable[] = [
            { model: RecipeInstruction, attributes: ['step', 'instruction'] }
        ]
        const recipe = await getRecipeDetails(recipeId, include); // Fetch the recipe by its ID and include associated instructions
        if (!recipe) { // If the recipe is not found, return a 404 error
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }
    
        // Step 4: Return the recipe instructions, include success (OR FAILURE) message
        res.status(200).json({
            id: recipeId,
            instructions: recipe.instructions, // The ingredients associated with the recipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe instructions from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }  
}

// Replace the Instructions for a Recipe
export const replaceRecipeInstructionsById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input
    const { instructions } = req.body;

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Step 3: Fulfill Request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Step 1: Delete the existing instructions for this recipe (inside transaction)
        await RecipeInstruction.destroy({
            where: { recipeId },
            transaction, // Pass the transaction
        });

        // Step 2: Add new instructions (inside transaction)
        await handleRecipeInstructions(recipeId, instructions, transaction);

        // Commit the transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Step 4: Return the updated recipe
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error replacing instructions for recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Get all Categories for a Recipe
export const getRecipeCategoriesById = async(req:Request, res:Response) => {
    const {id} = req.params; // Step 1: get user input

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    // Step 3: Fulfil Request
    try {
        // Fetch the recipe by its ID and include associated ingredients
        const include : Includeable[] = [{
            model: Category,
            attributes: ['id', 'name'], // You can add more fields if needed
            through: { attributes: [] }, 
        }];
        const recipe = await getRecipeDetails(recipeId, include);
        if (!recipe) { // If the recipe is not found, return a 404 error
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Step 4: Return the recipe's categories, include success (OR FAILURE) message
        res.status(200).json({
            id: recipeId,
            categories: recipe.categories, // The ingredients associated with the recipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe categories from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
}

// Add new Categories to a Recipe
export const addRecipeCategoriesById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input
    const { categories } = req.body;
    
    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Step 3: Fulfill Request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Add categories (inside transaction)
        await handleCategories(recipeId, categories, transaction);

        // Commit the transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Step 4: Return the updated recipe
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error adding category to recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Remove a Category from a Recipe By Id
export const removeRecipeCategoryByIdandCategoryId = async (req: Request, res: Response) => {
    const { id, category_id } = req.params; // Step 1: get user input

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    const categoryId = parseInt(category_id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    if (isNaN(categoryId)) {
        res.status(400).json({ message: 'Invalid category ID' });
        return;
    }

    // Step 3: Fulfill Request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Check if the category exists for the recipe (inside transaction)
        const categoryExists = await RecipeCategory.findOne({
            where: { recipeId, categoryId },
            transaction, // Pass the transaction
        });

        if (!categoryExists) {
            res.status(404).json({
                message: `Category with ID ${categoryId} not found for recipe with ID ${recipeId}`,
            });
            return;
        }

        // Delete the category association for the recipe (inside transaction)
        await RecipeCategory.destroy({
            where: { recipeId, categoryId },
            transaction, // Pass the transaction
        });

        // Commit the transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Step 4: Return success message (204 means no content returned)
        res.status(204).json({ message: `Deleted Category with id ${categoryId} from recipe with id ${recipeId}` });
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error removing category for recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};


// Get all Subcategories for a Recipe
export const getRecipeSubcategoriesById = async(req:Request, res:Response) => {
    const {id} = req.params; // Step 1: get user input
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) { // Step 2: validate and parse user input, return if bad input
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    // Step 3: Fulfil Request
    try {
        // Fetch the recipe by its ID and include associated subcategories
        const include : Includeable[] = [{
            model: Subcategory,
            attributes: ['id', 'name'], // You can add more fields if needed
            through: { attributes: [] }, 
        }];
        const recipe = await getRecipeDetails(recipeId, include);
        if (!recipe) {// If the recipe is not found, return a 404 error
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Step 4: Return the recipe's subcategories, include success (OR FAILURE) message
        res.status(200).json({ 
            id: recipeId,
            subcategories: recipe.subcategories, // The ingredients associated with the recipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe subcategories from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
}


// Add new Subcategories to a Recipe
export const addRecipeSubcategoriesById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input
    const { subcategories } = req.body;
    
    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Step 3: Fulfil request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Add subcategories (inside transaction)
        await handleSubcategories(recipeId, subcategories, transaction); // Pass transaction

        // Commit the transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);  

        // Step 4: Return the updated recipe
        res.status(201).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error adding subcategory to recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
}

// Remove a Subcategory from Recipe by Id
export const removeRecipeSubcategoriesByIdandSubcategoryId = async (req: Request, res: Response) => {
    const { id, subcategory_id } = req.params; // Step 1: get user input

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    const subcategoryId = parseInt(subcategory_id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    if (isNaN(subcategoryId)) {
        res.status(400).json({ message: 'Invalid subcategory ID' });
        return;
    }

    // Step 3: Fulfil request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Check if the subcategory exists for the recipe (inside transaction)
        const subcategoryExists = await RecipeSubcategory.findOne({
            where: { recipeId, subcategoryId },
            transaction, // Pass transaction
        });

        if (!subcategoryExists) {
            res.status(404).json({
                message: `Subcategory with ID ${subcategoryId} not found for recipe with ID ${recipeId}`,
            });
            return;
        }

        // Remove the subcategory for the recipe (inside transaction)
        await RecipeSubcategory.destroy({
            where: { recipeId, subcategoryId },
            transaction, // Pass transaction
        });

        // Commit the transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Step 4: Return the success (OR FAILURE) message (204 if successful)
        res.status(204).json({ message: `Deleted Subcategory with id ${subcategoryId} from recipe with id ${recipeId}` });
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error removing subcategory for recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};



// Get Images of Recipe
export const getRecipeImagesById = async(req:Request, res:Response) => {
    const {id} = req.params; // Step 1: get user input
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
        res.status(400).json({ errors: errors });
        return;
    }
    let { category, subcategory, nation, region, time, cost, sort, limit = 10, page = 1} = queryParams; 
    
    const recipeId = parseInt(id, 10); 
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    // Step 3: FUlfil Request
    try {
        // Validate limit and page to ensure they are numbers and within reasonable bounds
        limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
        page = Math.max(1, Number(page));

        // Sequelize query to fetch the filtered and sorted recipes with the required associations
        const rows  = await RecipeImage.findAll({
            where: { recipeId }, // Apply where conditions for filtering
            limit,
            offset: (page - 1) * limit,
        });
        if (!rows.length) { // If no results are found
            res.status(200).json({
                totalResults: 0,
                results: [],
            });
            return;
        }
        res.status(200).json({ // Return requested items and count (OR FAILURE) message
            totalResults: rows.length,
            results: rows,
        });

    } catch (error) {
        console.error(error);
        error = (error as Error);
        res.status(500).json({ message: 'Error fetching recipe images from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Add Recipe Image by ID
export const addRecipeImageById = async (req: Request, res: Response) => {
    const { id } = req.params; // Step 1: get user input
    const { images } = req.body;

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const validationResult = validateRecipeData(req.body);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Step 3: Fulfill request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        await handleRecipeImages(recipeId, images, transaction); // Pass transaction to handleRecipeImages function

        // Commit the transaction after all database operations are successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Step 4: Return the updated recipe
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: 'Error adding image to recipe', error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};

// Remove Recipe Image by ID
export const removeRecipeImageByIdandImageId = async (req: Request, res: Response) => {
    const { id, image_id } = req.params; // Step 1: get user input

    const recipeId = parseInt(id, 10); // Step 2: validate and parse user input, return if bad input
    const imageId = parseInt(image_id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    if (isNaN(imageId)) {
        res.status(400).json({ message: 'Invalid image ID' });
        return;
    }

    // Step 3: Fulfill request
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Check if the image exists for the recipe (inside transaction)
        const imageExists = await RecipeImage.findOne({
            where: { recipeId, id: imageId },
            transaction, // Pass the transaction
        });

        if (!imageExists) {
            res.status(404).json({
                message: `Image with ID ${imageId} not found for recipe with ID ${recipeId}`,
            });
            return;
        }

        // Remove the image for the recipe (inside transaction)
        await RecipeImage.destroy({
            where: { recipeId, id: imageId },
            transaction, // Pass the transaction
        });

        // Commit the transaction if everything is successful
        await transaction.commit();

        // Invalidate the old cache
        await RecipeCache.invalidateCache(recipeId);

        // Step 4: Return the success (OR FAILURE) message (204 if successful)
        res.status(204).json({ message: `Deleted Image with id ${imageId} from recipe with id ${recipeId}` });
    } catch (error) {
        // Rollback the transaction if an error occurs
        if (transaction) await transaction.rollback();

        console.error(error);
        res.status(500).json({ message: `Error removing image-${imageId} for recipe`, error: `${(error as Error).name}: ${(error as Error).message}` });
    }
};