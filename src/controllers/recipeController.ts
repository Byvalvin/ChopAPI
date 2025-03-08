import { NextFunction, Request,Response  } from 'express';
import { normalizeString } from '../utils';
import { Image } from '../interface';
import Recipe from '../models/Recipe';  // Import the Recipe model
import {Op, Includeable } from 'sequelize';
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
    handleCategories, handleIngredients, handleRecipeAliases, handleRecipeImages, handleRecipeInstructions, handleRegionAndNation, handleSubcategories
} from './controllerHelpers/recipeControllerHelpers'
import { images } from '../data';

// Main endpoint to get all recipes
export const getAllRecipes = async (req: Request, res: Response) => {
    let { category, subcategory, nation, region, time, cost, sort, limit = 10, page = 1, search } = req.query;

    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Generate the where and include conditions using the helper function
    const { whereConditions, includeConditions } = generateRecipeFilterConditions(req.query);

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
export const getAllRecipeWithName = async (req: Request, res: Response) => {
    const { name } = req.params; // Extract the name from the request params
    let { category, subcategory, nation, region, time, cost, limit = 10, page = 1, sort } = req.query;

    try {
        // Normalize the name parameter from the request
        const normalizedSearchTerm = normalizeString(name);

        // Generate the where conditions using the helper function (filters based on category, subcategory, etc.)
        const { whereConditions, includeConditions } = generateRecipeFilterConditions(req.query);

        // Apply name filter to the whereConditions
        whereConditions.name = { [Op.iLike]: `%${normalizedSearchTerm}%` }; // Match the recipe name

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
            where: whereConditions, // Apply where conditions for filtering
            include: includeConditions.length ? includeConditions : stdInclude, // Apply include conditions for associations
            limit: parseInt(limit as string, 10),
            offset: (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10),
            order: order, // Apply ordering
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
            rows.map(async (recipe) => await getRecipeDetails(recipe.id)) // Fetch detailed info for each recipe
        );

        // Return the paginated results with detailed recipe data
        res.status(200).json({
            totalResults: detailedRecipes.length,
            results: detailedRecipes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipes from the database' });
    }
};


// Get Names/Aliases for a Recipe
export const getRecipeNamesById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);

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

        // Collect the recipe name and its aliases (if any)
        const names = [recipe.name, ...(recipe.aliases || [])];

        // Return the recipe name(s) in the response
        res.status(200).json({
            id: recipeId,
            names: names
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe from the database' });
        return;
    }
};


// Replace aliases for a specific Recipe
export const replaceAliasForRecipeById = async (req: Request, res: Response) => {
    const { id } = req.params; // Recipe ID from params
    const { aliases } = req.body; // New aliases from request body
  
    // Ensure recipeId is an integer
    const recipeId = parseInt(id, 10);
  
    if (isNaN(recipeId)) {
      res.status(400).json({ message: 'Invalid recipe ID' });
      return;
    }
  
    try {
  
      // Step 3: Clear the current aliases (delete all existing aliases for this recipe)
      await RecipeAlias.destroy({
        where: { recipeId }, // Delete aliases associated with this recipe
      });
  
      // Step 4: Add the new aliases
      await handleRecipeAliases(recipeId, aliases);
  
      // Step 5: Return the updated recipe along with the new aliases
      res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating aliases for recipe' });
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
  
    try {
        await handleRecipeAliases(recipeId, aliases);
  
      // Step 4: Return the updated recipe along with the new aliases
      res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding alias to recipe' });
    }
  };

// Get Ingredients for a specific Recipe
export const getRecipeIngredientsById = async (req: Request, res: Response) => {
    const { id } = req.params; // Recipe ID from request params
    const recipeId = parseInt(id, 10);
  
    if (isNaN(recipeId)) {
      res.status(400).json({ message: 'Invalid recipe ID' });
      return;
    }
  
    try {
      // Fetch the recipe by its ID and include associated ingredients
      const include : Includeable[] = [{
        model: Ingredient,
        attributes: ['id', 'name'], // You can add more fields if needed
        through: { attributes: ['quantity','unit'] }, 
      }];
      const recipe = await getRecipeDetails(recipeId, include);
  
      // If the recipe is not found, return a 404 error
      if (!recipe) {
        res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
        return;
      }
  
      // Return the recipe's ingredients
      res.status(200).json({
        id: recipeId,
        ingredients: recipe.ingredients, // The ingredients associated with the recipe
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching recipe ingredients from the database' });
    }
  };

// Replace Ingredients for a specific Recipe
export const replaceRecipeIngredientsById = async (req:Request, res:Response)=>{
    const {id} = req.params;
    const {ingredients} = req.body;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    try {
  
        // Step 3: Clear the current aliases (delete all existing aliases for this recipe)
        await RecipeIngredient.destroy({
          where: { recipeId }, // Delete aliases associated with this recipe
        });
    
        // Step 4: Add the new aliases
        await handleIngredients(recipeId, ingredients);
    
        // Step 5: Return the updated recipe along with the new aliases
        res.status(200).json(await getRecipeDetails(recipeId));
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating aliases for recipe' });
      }
}

// Add new Ingredients for a specific Recipe
export const addRecipeIngredientsById = async(req:Request, res:Response) => {
    const {id} = req.params;
    const {ingredients} = req.body;
    
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    try {
        await handleIngredients(recipeId, ingredients);
  
      // Step 4: Return the updated recipe along with the new aliases
      res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding alias to recipe' });
    }
}


// Remove a Recipe Ingredient by Id with Ingredient Id
export const removeRecipeIngredientByIdandIngredientId = async(req:Request, res:Response) => {
    const {id, ingredient_id} = req.params;

    const recipeId = parseInt(id, 10);
    const ingredientId = parseInt(ingredient_id, 10);

    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    if (isNaN(ingredientId)) {
        res.status(400).json({ message: 'Invalid ingredient ID' });
        return;
    }
    try {
  
        // Step 3: Clear the current aliases (delete all existing aliases for this recipe)
        await RecipeIngredient.destroy({
          where: { recipeId, ingredientId }, // Delete aliases associated with this recipe
        });
    
        // Step 5: Return the updated recipe along with the new aliases
        res.status(200).json(await getRecipeDetails(recipeId));
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating aliases for recipe' });
      }
}

// Get the Instructions for a Recipe
export const getRecipeInstructionsById = async (req:Request, res:Response) => {
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
      }
    try {
      // Fetch the recipe by its ID and include associated ingredients
      const include : Includeable[] = [
        { model: RecipeInstruction, attributes: ['step', 'text'] }
    ]
      const recipe = await getRecipeDetails(recipeId, include);
  
      // If the recipe is not found, return a 404 error
      if (!recipe) {
        res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
        return;
      }
  
      // Return the recipe's ingredients
      res.status(200).json({
        id: recipeId,
        instructions: recipe.instructions, // The ingredients associated with the recipe
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching recipe ingredients from the database' });
    }  

}

// Replace the Instructions for a Recipe
export const replaceRecipeInstructionsById = async(req:Request, res:Response) => {
    const {id} = req.params;
    const {instructions} = req.body;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    try {
  
        // Step 3: Clear the current aliases (delete all existing aliases for this recipe)
        await RecipeInstruction.destroy({
          where: { recipeId }, // Delete aliases associated with this recipe
        });
    
        // Step 4: Add the new aliases
        await handleRecipeInstructions(recipeId, instructions);
    
        // Step 5: Return the updated recipe along with the new aliases
        res.status(200).json(await getRecipeDetails(recipeId));
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating aliases for recipe' });
      }
}

// Get all Categories for a Recipe
export const getRecipeCategoriesById = async(req:Request, res:Response) => {
    const {id} = req.params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    try {
        // Fetch the recipe by its ID and include associated ingredients
        const include : Includeable[] = [{
            model: Category,
            attributes: ['id', 'name'], // You can add more fields if needed
            through: { attributes: [] }, 
        }];
        const recipe = await getRecipeDetails(recipeId, include);

        // If the recipe is not found, return a 404 error
        if (!recipe) {
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Return the recipe's ingredients
        res.status(200).json({
            id: recipeId,
            categories: recipe.categories, // The ingredients associated with the recipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe ingredients from the database' });
    }
}

// Add new Categories to a Recipe
export const addRecipeCategoriesById = async(req:Request, res:Response) => {
    const {id} = req.params;
    const {categories} = req.body;
    
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    try {
        await handleCategories(recipeId, categories);
  
      // Step 4: Return the updated recipe along with the new aliases
      res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding alias to recipe' });
    }
}

// Remove a Category from a Recipe BY Id
export const removeRecipeCategoryByIdandCategoryId = async(req:Request, res:Response, next:NextFunction) => {
    const {id, category_id} = req.params;

    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const categoryId = parseInt(category_id, 10);

    try {
        // Step 3: Clear the current aliases (delete all existing aliases for this recipe)
        await RecipeCategory.destroy({
            where: { recipeId, categoryId }, // Delete aliases associated with this recipe
        });

        // Step 5: Return the updated recipe along with the new aliases
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating aliases for recipe' });
    }
}


// Get all Subcategories for a Recipe
export const getRecipeSubcategoriesById = async(req:Request, res:Response) => {
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    try {
        // Fetch the recipe by its ID and include associated ingredients
        const include : Includeable[] = [{
            model: Subcategory,
            attributes: ['id', 'name'], // You can add more fields if needed
            through: { attributes: [] }, 
        }];
        const recipe = await getRecipeDetails(recipeId, include);

        // If the recipe is not found, return a 404 error
        if (!recipe) {
            res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
            return;
        }

        // Return the recipe's ingredients
        res.status(200).json({
            id: recipeId,
            subcategories: recipe.subcategories, // The ingredients associated with the recipe
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe ingredients from the database' });
    }
}


// Add new Subcategories to a Recipe
export const addRecipeSubcategoriesById = async(req:Request, res:Response) => {
    const {id} = req.params;
    const {subcategories} = req.body;
    
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    try {
        await handleSubcategories(recipeId, subcategories);
  
      // Step 4: Return the updated recipe along with the new aliases
      res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding alias to recipe' });
    }
}

// Remove a Subcategory from Recipe by Id
export const removeRecipeSubcategoriesByIdandSubcategoryId = async(req:Request, res:Response, next:Function) => {
    const {id, subcategory_id} = req.params;
    // Check if the id is a valid number (ID should be numeric) for now, will update when we use proper ids but works ok

    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const subcategoryId = parseInt(subcategory_id, 10);

    try {
        // Step 3: Clear the current aliases (delete all existing aliases for this recipe)
        await RecipeSubcategory.destroy({
            where: { recipeId, subcategoryId }, // Delete aliases associated with this recipe
        });

        // Step 5: Return the updated recipe along with the new aliases
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating aliases for recipe' });
    }
}



// Get Images of Recipe
export const getRecipeImagesById = async(req:Request, res:Response) => {
    const {id} = req.params;
    let {limit=10,page=1} = req.query;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    try {

        // Validate limit and page to ensure they are numbers and within reasonable bounds
        limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
        page = Math.max(1, Number(page));


        // Sequelize query to fetch the filtered and sorted recipes with the required associations
        const { count, rows } = await RecipeImage.findAndCountAll({
            where: { recipeId }, // Apply where conditions for filtering
            limit,
            offset: (page - 1) * limit,
        });

        // If no results are found
        if (!rows.length) {
            res.status(200).json({
                totalResults: 0,
                results: [],
            });
            return;
        }
        res.status(200).json({
            totalResults: rows.length,
            results: rows,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recipe ingredients from the database' });
    }
}

// Add new Images to Recipe
export const addRecipeImageById = async(req:Request, res:Response) => {
    const {id} = req.params;
    const {images} = req.body;

    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    try {
        await handleRecipeImages(recipeId, images);
  
      // Step 4: Return the updated recipe along with the new aliases
      res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding alias to recipe' });
    }
}



// Remove Image of Recipe
export const removeRecipeImageByIdandImageId = async(req:Request, res:Response) => {
    const {id, image_id} = req.params;

    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }
    const imageId = parseInt(image_id, 10);

    try {
        // Step 3: Clear the current aliases (delete all existing aliases for this recipe)
        await RecipeImage.destroy({
            where: { recipeId, imageId }, // Delete aliases associated with this recipe
        });

        // Step 5: Return the updated recipe along with the new aliases
        res.status(200).json(await getRecipeDetails(recipeId));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating aliases for recipe' });
    }
}
