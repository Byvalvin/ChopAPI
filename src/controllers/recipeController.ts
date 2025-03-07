import { NextFunction, Request,Response  } from 'express';
import { recipes, ingredients as ingredientDB, categories as categoriesDB, subcategories as subcategoriesDB, images as imagesDB,regions as regionsDB } from '../data'; // Importing the simulated DB
// import { Recipe, Region, Ingredient, Category, Subcategory, RecipeIngredient, Image } from '../interface';
import { normalizeString } from '../utils';
import { Recipe as RecipeI, RecipeIngredient as RecipeIngredientI, Image } from '../interface';
import Recipe from '../models/Recipe';  // Import the Recipe model
import { Sequelize, Op, Includeable } from 'sequelize';
import Ingredient from '../models/Ingredient';
import RecipeIngredient from '../models/RecipeIngredient';
import Category from '../models/Category';
import Subcategory from '../models/Subcategory';
import Region from '../models/Region';
import Nation from '../models/Nation';
import RegionNation from '../models/RegionNation';
import RecipeCategory from '../models/RecipeCategory';
import RecipeSubcategory from '../models/RecipeSubcategory';
import RecipeInstruction from '../models/RecipeInstruction';
import RecipeAlias from '../models/RecipeAlias';
import RecipeImage from '../models/RecipeImage';

import {
    validSortFields, stdInclude, 
    getRecipeDetails, generateRecipeFilterConditions,
    handleCategories, handleIngredients, handleRecipeAliases, handleRecipeImages, handleRecipeInstructions, handleRegionAndNation, handleSubcategories
} from './controllerHelpers/recipeControllerHelpers'


// Main endpoint to get all recipes
export const getAllRecipes = async (req: Request, res: Response) => {
    let { category, subcategory, nation, region, time, cost, sort, limit = 10, page = 1, search } = req.query;

    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Generate the where conditions using the helper function
    const whereConditions = generateRecipeFilterConditions(req.query);

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

    // Sequelize findAll query with dynamic conditions and sorting
    try {
        // Fetching recipe IDs based on dynamic conditions
        const { count, rows } = await Recipe.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Ingredient,  // Correct model reference
                    through: { attributes: [] }, // Optionally exclude the join table
                },
            ],
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
            if (detailedRecipe) {
                detailedRecipes.push(detailedRecipe);
            }
        }

        // Return paginated results with detailed recipes
        res.status(200).json({
            totalResults: detailedRecipes.length,
            results: detailedRecipes,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipes from the database' });
    }
};

// Add A New Recipe
export const addRecipe = async (req: Request, res: Response) => {
    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body;

    // Validate required fields
    if (!(name && description && nation && region && ingredients && instructions && time !== undefined)) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
    }

    // Handle Region and Nation
    const { regionId, nationId } = await handleRegionAndNation(region, nation);
    // Create the new Recipe object
    try {
        const newRecipe = await Recipe.create({
            name,
            description,
            nationId,
            regionId,
            time,
            cost: cost || 0
        });

        // Handle Ingredients
        await handleIngredients(newRecipe.id, ingredients);
        // Handle Categories and Subcategories
        if (categories) await handleCategories(newRecipe.id, categories);
        if (subcategories) await handleSubcategories(newRecipe.id, subcategories);

        // Handle Recipe Instructions, Aliases, and Images if needed
        await handleRecipeInstructions(newRecipe.id, instructions);
        await handleRecipeAliases(newRecipe.id, aliases);
        await handleRecipeImages(newRecipe.id, images);

        // Return response with the new recipe's ID
        res.status(201).json({ message: `Recipe added with ID: ${newRecipe.id}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding recipe' });
    }
};

// Get Recipe by ID
export const getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Extract the recipe ID from the request parameters

    if (isNaN(Number(id))) {  // Check if the ID is a valid number (ID should be numeric)
        return next();  // If it's not a number, pass to the next route handler
    }

    const recipeId = parseInt(id, 10);  // Convert ID to an integer
    try {
        // Use getRecipeDetails to fetch the recipe details by ID
        const recipe = await getRecipeDetails(recipeId);

        if (!recipe) {
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Return the recipe details with status 200
        res.status(200).json(recipe);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe details' });
        return;
    }
};

export const replaceRecipeById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {  
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }

    // Get user data from the request body
    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body;

    // Basic validation of required fields
    if (!(name && description && nation && ingredients && instructions && time !== undefined)) {
        res.status(400).json({
            message: "Missing required fields: name, description, nation, ingredients, instructions, and time are required."
        });
        return;
    }

    try {
        // Find the recipe in the database
        const recipe = await Recipe.findOne({
            where: { id: recipeId },
            include: stdInclude,
        });

        if (!recipe) {
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Check if the recipe name already exists (if name should be unique)
        const existingRecipe = await Recipe.findOne({
            where: { name, id: { [Op.ne]: recipeId } }
        });

        if (existingRecipe) {
            res.status(400).json({ message: `A recipe with the name '${name}' already exists.` });
            return;
        }

        // Delete existing associations before adding new ones
        await RecipeIngredient.destroy({ where: { recipeId } });  // Delete previous ingredients
        await RecipeCategory.destroy({ where: { recipeId } });  // Delete previous categories
        await RecipeSubcategory.destroy({ where: { recipeId } });  // Delete previous subcategories
        await RecipeAlias.destroy({ where: { recipeId } });  // Delete previous aliases
        await RecipeImage.destroy({ where: { recipeId } });  // Delete previous images
        await RecipeInstruction.destroy({ where: { recipeId } });  // Delete previous instructions

        // Handle ingredients, categories, subcategories, and region updates
        const { regionId, nationId } = await handleRegionAndNation(region, nation);
        await handleIngredients(recipe.id, ingredients);  // Handling ingredients (replace)
        await handleCategories(recipe.id, categories as string[]);  // Handling categories (replace)
        await handleSubcategories(recipe.id, subcategories as string[]);  // Handling subcategories (replace)
        await handleRecipeInstructions(recipe.id, instructions as string[]);  // Handling instructions (replace)
        await handleRecipeAliases(recipe.id, aliases as string[]);  // Handling aliases (replace)
        await handleRecipeImages(recipe.id, images as Image[]);  // Handling images (replace)

        // Update the recipe fields in the database
        await recipe.update({
            name,
            description,
            nation,
            regionId,  // Using regionId after resolving region
            nationId,  // Using nationId after resolving nation
            time,
            cost: cost || 0,
        });

        // Return the updated recipe data
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating recipe data' });
    }
};

// Update Recipe by Id
export const updateRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
    }

    // Extract the recipe data from the request body
    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body;

    try {
        // Find the recipe in the database
        const recipe = await Recipe.findOne({
            where: { id: recipeId },
            include: stdInclude
        });

        if (!recipe) {
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Handle fields that are passed in the request
        const updatedFields = {
            name: name || recipe.name,
            description: description || recipe.description,
            time: time || recipe.time,
            cost: cost !== undefined ? cost : recipe.cost, // Ensure cost is only updated if provided
        };

        // Handle updates for relational data (ingredients, categories, subcategories, etc.)
        if (ingredients) await handleIngredients(recipeId, ingredients);
        if (categories) await handleCategories(recipeId, categories);
        if (subcategories) await handleSubcategories(recipeId, subcategories);
        if (instructions) await handleRecipeInstructions(recipeId, instructions);
        if (aliases) await handleRecipeAliases(recipeId, aliases);
        if (images) await handleRecipeImages(recipeId, images);
        // Handle the region and nation update
        const { regionId, nationId } = await handleRegionAndNation(region, nation);

        // Now update the recipe fields in the database
        await recipe.update({
            ...updatedFields, // Spread the updated fields
            regionId,  // Update regionId after resolving region
            nationId,  // Update nationId after resolving nation
        });

        // Return the updated recipe details
        const updatedRecipe = await getRecipeDetails(recipeId);
        res.status(200).json(updatedRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating recipe data' });
    }
};

// Get Recipes with a given name
// Updated getAllRecipeWithName endpoint
export const getAllRecipeWithName = async (req: Request, res: Response) => {
    const { name } = req.params; // Extract the name from the request params
    let { category, subcategory, nation, region, time, cost, limit = 10, page = 1, sort } = req.query;

    try {
        // Normalize the name parameter from the request
        const normalizedSearchTerm = normalizeString(name);

        // Generate the where conditions using the helper function
        const whereConditions: any = {
            [Op.or]: [
                // Check if the normalized name matches the search term
                { name: { [Op.iLike]: `%${normalizedSearchTerm}%` } },
                // Check if any normalized alias matches the search term
                { '$RecipeAliases.alias$': { [Op.iLike]: `%${normalizedSearchTerm}%` } }
            ]
        };

        // Apply additional filters using the helper function (category, subcategory, nation, etc.)
        const additionalConditions = generateRecipeFilterConditions(req.query);
        Object.assign(whereConditions, additionalConditions);

        // Apply sorting
        let order: any = [];
        if (sort) {
            order = [[sort, 'ASC']];
        } else {
            // Default sorting by name if no sort is provided
            order = [['name', 'ASC']];
        }

        // Sequelize query to fetch the filtered and sorted recipes with the required associations
        const { count, rows } = await Recipe.findAndCountAll({
            where: whereConditions,
            include: [
                // Ensure RecipeAliases is included
                {
                    model: RecipeAlias,
                    required: false, // Allow recipes without aliases
                    where: {
                        alias: { [Op.iLike]: `%${normalizedSearchTerm}%` }
                    }
                },
                // Include other necessary relationships (e.g., Category, Nation, Region, etc.)
                ...stdInclude
            ],
            limit: parseInt(limit as string, 10),
            offset: (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
            order: order,
        });

        // If no recipes are found, return an empty result
        if (!rows.length) {
            res.status(200).json({
                totalResults: 0,
                results: []
            });
            return;
        }

        // Fetch detailed recipe data using the getRecipeDetails function
        const detailedRecipes = await Promise.all(
            rows.map(async (recipe) => await getRecipeDetails(recipe.id))
        );

        // Return the paginated results with detailed recipe data
        res.status(200).json({
            totalResults: count,
            results: detailedRecipes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipes from the database' });
    }
};





// // Get Names/Aliases for a Recipe
// export const getRecipeNamesById = (req:Request, res:Response)=>{
//     const {id} = req.params;
//     const recipeId = parseInt(id, 10);

//     const recipe : Recipe = recipes.find(recipe => recipe.id==recipeId) as Recipe;
//     if(!recipe){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     res.status(200).json({
//         id:recipeId,
//         names:[recipe.name, ...(recipe.aliases || [])]
//     });
// }

// // Replace aliases for a specific Recipe
// export const replaceAliasForRecipeById = (req:Request, res:Response)=>{
//     const {id} = req.params;
//     const {aliases} = req.body; // name is the new name to be added
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id==recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {aliases};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     const updated : Recipe = {
//         ...recipes[recipeToUpdateIndex],
//         aliases
//     }
//     recipes[recipeToUpdateIndex] = updated;

//     res.status(200).json({
//         id:recipeId,
//         name:recipes[recipeToUpdateIndex].name,
//         aliases:[...(recipes[recipeToUpdateIndex].aliases || [])]
//     });
// }

// // Add a new alias for a specific Recipe
// export const addAliasToRecipeById = (req:Request, res:Response)=>{
//     const {id} = req.params;
//     const {aliases} = req.body; // name is the new name to be added
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id==recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {aliases};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     const updated : Recipe = {
//         ...recipes[recipeToUpdateIndex],
//         aliases : [...(recipes[recipeToUpdateIndex].aliases || []), ...aliases]
//     }
//     recipes[recipeToUpdateIndex] = updated;

//     res.status(200).json({
//         id:recipeId,
//         name:recipes[recipeToUpdateIndex].name,
//         aliases:[...(recipes[recipeToUpdateIndex].aliases || [])]
//     });
// }

// // Get Ingredients for a specific Recipe
// export const getRecipeIngredientsById = (req:Request, res:Response)=>{
//     const {id} = req.params;
//     const recipeId = parseInt(id, 10);

//     const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
//     if(!recipe){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     res.status(200).json({
//         id:recipeId,
//         ingredients:recipe.ingredients
//     });
// }

// // Replace Ingredients for a specific Recipe
// export const replaceRecipeIngredientsById = (req:Request, res:Response)=>{
//     const {id} = req.params;
//     const {ingredients} = req.body;
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {ingredients};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     const recipeIngredients = handleIngredients(ingredients);
//     const updated : Recipe = {
//         ...recipes[recipeToUpdateIndex],
//         ingredients: recipeIngredients
//     };
//     recipes[recipeToUpdateIndex] = updated;

//     res.status(200).json(recipes[recipeToUpdateIndex]);
// }

// // Add new Ingredients for a specific Recipe
// export const addRecipeIngredientsById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const {ingredients} = req.body;
    
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {ingredients};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     const moreIngredients = handleIngredients(ingredients);
//     const updated : Recipe = {
//         ...recipes[recipeToUpdateIndex],
//         ingredients : [...recipes[recipeToUpdateIndex].ingredients, ...moreIngredients],
//     }
//     recipes[recipeToUpdateIndex] = updated;
    
//     res.status(201).json(recipes[recipeToUpdateIndex]);
// }


// // helper for specific ingredient updates
// // if (typeof ingredient.name !== 'string') return { message: 'Each ingredient must have a valid name' };
// const validateIngredient = (ingredient : RecipeIngredient) => { // assumes name is proper
//     if (typeof ingredient.quantity !== 'number') return { message: 'Each ingredient must have a valid quantity (number)' };
//     if (typeof ingredient.unit !== 'string') return { message: 'Each ingredient must have a valid unit (string)' };
//     return undefined;
// }

// // Update a Recipe Ingredient by Id with Ingredient Id
// export const updateRecipeIngredientByIdandIngredientId = (req:Request, res:Response) => {
//     const {id, ingredient_id} = req.params;
//     const {ingredient} = req.body;
//     const {quantity, unit} = ingredient;
//     if(!(quantity || unit)){
//         res.status(400).json({message:"Missing required fields"});
//         return;
//     }

//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     const ingredientId = parseInt(ingredient_id, 10);
//     const ingredientToUpdateIndex = recipes[recipeToUpdateIndex].ingredients.findIndex(ingredient => ingredient.id===ingredientId);
//     if(ingredientToUpdateIndex===-1){
//         res.status(404).json({message:`Ingredient with id: ${ingredientId} not found`});
//         return;
//     }

//     const recipeData = { ...ingredient, name:recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex].name};
//     const validationResult = validateIngredient(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     const updatedIngredient : RecipeIngredient = {
//         ...recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex],
//         quantity : quantity || recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex].quantity,
//         unit : unit || recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex].unit
//     }
//     recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex] = updatedIngredient;

//     res.status(201).json(recipes[recipeToUpdateIndex].ingredients);
// }

// // Remove a Recipe Ingredient by Id with Ingredient Id
// export const removeRecipeIngredientByIdandIngredientId = (req:Request, res:Response) => {
//     const {id, ingredient_id} = req.params;

//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//     }
//     const ingredientId = parseInt(ingredient_id, 10);
//     const ingredientToUpdateIndex = recipes[recipeToUpdateIndex].ingredients.findIndex(ingredient => ingredient.id===ingredientId);
//     if(ingredientToUpdateIndex===-1){
//         res.status(404).json({message:`Ingredient with id: ${ingredientId} not found`});
//         return;
//     }

//     const updatedIngredients : RecipeIngredient[] = recipes[recipeToUpdateIndex].ingredients.filter(ingredient => ingredient.id!==ingredientId);
//     recipes[recipeToUpdateIndex].ingredients = updatedIngredients;
//     res.status(204).json({message:`deleted ingredient with id ${ingredientId}`});
// }

// // Get the Instructions for a Recipe
// export const getRecipeInstructionsById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const recipeId = parseInt(id, 10);

//     const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
//     if(!recipe){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     res.status(200).json({
//         id:recipeId,
//         name:recipe.name,
//         instructions:recipe.instructions
//     });  
// }

// // Replace the Instructions for a Recipe
// export const replaceRecipeInstructionsById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const {instructions} = req.body;
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     console.log(id,recipeId,recipeToUpdateIndex);

//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {instructions};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     const updated : Recipe = {
//         ...recipes[recipeToUpdateIndex],
//         instructions
//     };
//     recipes[recipeToUpdateIndex] = updated;
//     res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, instructions});

// }

// // Get all Categories for a Recipe
// export const getRecipeCategoriesById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const recipeId = parseInt(id, 10);

//     const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
//     if(!recipe){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     res.status(200).json({
//         id:recipeId,
//         name:recipe.name,
//         categories:recipe.categories
//     });
// }

// // Add new Categories to a Recipe
// export const addRecipeCategoriesById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const {categories} = req.body;
    
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {categories};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     let newCategories = handleCategories(categories);
//     const added : Category[] = recipes[recipeToUpdateIndex].categories || [];
//     newCategories = newCategories.filter((category: Category) => {
//         // Check if the category already exists in 'added' list
//         return !added.some(aCategory => aCategory.name === category.name);
//     });
//     const updated : Recipe = {
//         ...recipes[recipeToUpdateIndex],
//         categories : [...recipes[recipeToUpdateIndex].categories || [], ...newCategories],
//     }
//     recipes[recipeToUpdateIndex] = updated;
    
//     res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, categories:recipes[recipeToUpdateIndex].categories});
// }

// // Remove a Category from a Recipe BY Id
// export const removeRecipeCategoryByIdandCategoryId = (req:Request, res:Response, next:NextFunction) => {
//     const {id, category_id} = req.params;
//     console.log(category_id)

//     // Check if the id is a valid number (ID should be numeric) for now, will update when we use proper ids but works ok
//     if (isNaN(Number(category_id))) {
//         return next(); // If it's not a number, pass to the next route handler
//     }
    
//     const recipeId = parseInt(id, 10);
//     const categoryId = parseInt(category_id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     const categoryToDeleteIndex = recipes[recipeToUpdateIndex].categories?.findIndex(category => category.id===categoryId);
//     if(categoryToDeleteIndex===-1){
//         res.status(404).json({message:`Category with id: ${categoryId} not found`}); 
//         return;
//     }

//     const updatedCategories : Category[] = recipes[recipeToUpdateIndex].categories?.filter(category => category.id!==categoryId) as Category[];
//     recipes[recipeToUpdateIndex].categories = updatedCategories;

//     res.status(204).json({message:`deleted category with id ${categoryId}`});
// }

// // Remove a Category from a Recipe By Name
// export const removeRecipeCategoryByIdandCategoryName = (req:Request, res:Response) => {
//     const {id, category_name} = req.params;
    
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     const categoryToDeleteIndex = recipes[recipeToUpdateIndex].categories?.findIndex(category => normalizeString(category.name)===normalizeString(category_name));
//     if(categoryToDeleteIndex===-1){
//         res.status(404).json({message:`Category with name: ${category_name} not found`}); 
//         return;
//     }

//     const updatedCategories : Category[] = recipes[recipeToUpdateIndex].categories?.filter(category => normalizeString(category.name)!==normalizeString(category_name)) as Category[];
//     recipes[recipeToUpdateIndex].categories = updatedCategories;

//     res.status(204).json({message:`deleted category with name ${category_name}`});
// }

// // Get all Subcategories for a Recipe
// export const getRecipeSubcategoriesById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const recipeId = parseInt(id, 10);

//     const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
//     if(!recipe){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     res.status(200).json({
//         id:recipeId,
//         subcategories:recipe.subcategories
//     });
// }

// // Add new Subcategories to a Recipe
// export const addRecipeSubcategoriesById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const {subcategories} = req.body;
    
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {subcategories};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     let newSubcategories = handleSubcategories(subcategories);
//     const added : Subcategory[] = recipes[recipeToUpdateIndex].subcategories || [];
//     newSubcategories = newSubcategories.filter((subcategory: Subcategory) => {
//         // Check if the subcategory already exists in 'added' list
//         return !added.some(aSubcategory => aSubcategory.name === subcategory.name);
//     });
//     const updated : Recipe = {
//         ...recipes[recipeToUpdateIndex],
//         subcategories : [...recipes[recipeToUpdateIndex].subcategories || [], ...newSubcategories],
//     }
//     recipes[recipeToUpdateIndex] = updated;
    
//     res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, subcategories:recipes[recipeToUpdateIndex].subcategories});
// }

// // Remove a Subcategory from Recipe by Id
// export const removeRecipeSubcategoriesByIdandSubcategoryId = (req:Request, res:Response, next:Function) => {
//     const {id, subcategory_id} = req.params;
//     // Check if the id is a valid number (ID should be numeric) for now, will update when we use proper ids but works ok
//     if (isNaN(Number(subcategory_id))) {
//         return next(); // If it's not a number, pass to the next route handler
//     }
    
//     const recipeId = parseInt(id, 10);
//     const subcategoryId = parseInt(subcategory_id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     const subcategoryToDeleteIndex = recipes[recipeToUpdateIndex].subcategories?.findIndex(subcategory => subcategory.id===subcategoryId);
//     if(subcategoryToDeleteIndex===-1){
//         res.status(404).json({message:`Category with id: ${subcategoryId} not found`}); 
//         return;
//     }

//     const updatedSubcategories : Subcategory[] = recipes[recipeToUpdateIndex].subcategories?.filter(subcategory => subcategory.id!==subcategoryId) as Subcategory[];
//     recipes[recipeToUpdateIndex].subcategories = updatedSubcategories;

//     res.status(204).json({message:`deleted category with id ${subcategoryId}`});
// }

// // Remove a Subcategory from Recipe by name
// export const removeRecipeSubcategoriesByIdandSubcategoryName = (req:Request, res:Response) => {
//     const {id, subcategory_name} = req.params;
    
//     const recipeId = parseInt(id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     const subcategoryToDeleteIndex = recipes[recipeToUpdateIndex].subcategories?.findIndex(subcategory => normalizeString(subcategory.name)===normalizeString(subcategory_name));
//     if(subcategoryToDeleteIndex===-1){
//         res.status(404).json({message:`Category with name: ${subcategory_name} not found`}); 
//         return;
//     }

//     const updatedSubcategories : Subcategory[] = recipes[recipeToUpdateIndex].subcategories?.filter(subcategory => normalizeString(subcategory.name)!==normalizeString(subcategory_name)) as Subcategory[];
//     recipes[recipeToUpdateIndex].subcategories = updatedSubcategories;

//     res.status(204).json({message:`deleted subcategory with name ${subcategory_name}`});
// }

// // Get Images of Recipe
// export const getRecipeImagesById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const {limit=10,page=1} = req.query;
//     const recipeId = parseInt(id, 10);

//     const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
//     if(!recipe){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     // Apply pagination (limit and page)
//     let allImages : Image[] = recipe.images || [];
//     const startIndex = (Number(page) - 1) * Number(limit);
//     const endIndex = startIndex + Number(limit);
//     const paginated = allImages.slice(startIndex, endIndex);

//     // Check if the page is out of range
//     if (startIndex >= allImages.length) {
//         res.status(200).json({
//             totalResults: paginated.length,
//             results: [],
//         });
//     }

//     res.status(200).json({id:recipeId, name:recipe.name, images:paginated});
// }

// // Add new Images to Recipe
// export const addRecipeImageById = (req:Request, res:Response) => {
//     const {id} = req.params;
//     const {images} = req.body;
//     const recipeId = parseInt(id, 10);

//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }

//     const recipeData = {images};
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     let newImages = handleImages(images);
//     const added : Image[] = recipes[recipeToUpdateIndex].images || [];
//     newImages = newImages.filter((image: Image) => {
//         // Check if the image already exists in 'added' list
//         return !added.some(aImage => aImage.url === image.url);
//     });

//     const updatedImages : Image[] = [...(recipes[recipeToUpdateIndex].images || []), ...newImages] as Image[];
//     recipes[recipeToUpdateIndex].images = updatedImages;

//     res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, images:recipes[recipeToUpdateIndex].images});
// }

// // Remove Image of Recipe
// export const removeRecipeImageByIdandImageId = (req:Request, res:Response) => {
//     const {id, image_id} = req.params;

//     const recipeId = parseInt(id, 10);
//     const imageId = parseInt(image_id, 10);
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
//     if(recipeToUpdateIndex===-1){
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     const imageToDeleteIndex = recipes[recipeToUpdateIndex].images?.findIndex(image => image.id===imageId);
//     if(imageToDeleteIndex===-1){
//         res.status(404).json({message:`Image with id: ${image_id} not found`}); 
//         return;
//     }

//     const updatedImages : Image[] = recipes[recipeToUpdateIndex].images?.filter(image => image.id!==imageId) as Image[];
//     recipes[recipeToUpdateIndex].images = updatedImages;

//     res.status(204).json({message:`deleted image with id ${imageId}`});
// }