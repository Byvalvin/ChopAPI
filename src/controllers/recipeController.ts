import { NextFunction, Request,Response  } from 'express';
import { recipes, ingredients as ingredientDB, categories as categoriesDB, subcategories as subcategoriesDB, images as imagesDB,regions as regionsDB } from '../data'; // Importing the simulated DB
import { Recipe, Region, Ingredient, Category, Subcategory, RecipeIngredient, Image } from '../interface';
import { normalizeString } from '../utils';

// import Recipe from '../models/Recipe';  // Import the Recipe model

// Validation Helper
export const validateRecipeData = (data: any) => {
    const { name, description, nation, ingredients, instructions, region, aliases, categories, subcategories, images, time, cost } = data;

    // Basic field validation (only validate required fields if they are present)
    if (name && typeof name !== 'string') return { message: "Invalid data type: name must be a string." };
    if (description && typeof description !== 'string') return { message: "Invalid data type: description must be a string." };
    if (nation && typeof nation !== 'string') return { message: "Invalid data type: nation must be a string." };
    
    // Validate ingredients and instructions only if provided
    if (ingredients && !Array.isArray(ingredients)) return { message: "Invalid data type: ingredients must be an array." };
    if (instructions && !Array.isArray(instructions)) return { message: "Invalid data type: instructions must be an array." };
    if (instructions) { // Validate each instruction (if provided)
        for (const instruction of instructions as string[]) {
            if (typeof instruction !== 'string') return { message: 'Each instruction must have a valid text (string)' };   
        }
    }
    if (ingredients) { // Ensure each ingredient has a valid structure (if provided)
        for (const ingredient of ingredients as RecipeIngredient[]) {
            if (typeof ingredient.name !== 'string') return { message: 'Each ingredient must have a valid name' };
            if (typeof ingredient.quantity !== 'number') return { message: 'Each ingredient must have a valid quantity (number)' };
            if (typeof ingredient.unit !== 'string') return { message: 'Each ingredient must have a valid unit (string)' };
        }
    }
    if (ingredients && ingredients.length === 0) return { message: "Ingredients cannot be empty." };
    if (instructions && instructions.length === 0) return { message: "Instructions cannot be empty." };
    if (time !== undefined && (typeof time !== 'number' || time <= 0)) return { message: "Invalid time value: time must be a positive number." }; // Validate time (only if provided)

    // Validate optional fields
    if (region && typeof region !== 'string') return { message: "Invalid data type: region must be a string." };
    if (aliases && !Array.isArray(aliases)) return { message: "Invalid data type: aliases must be an array." };
    if (aliases) { // Validate each alias (if provided)
        for (const alias of aliases as string[]) {
            if (typeof alias !== 'string') return { message: 'Each alias must be a (string)' };
        }
    }
    if (categories && !Array.isArray(categories)) return { message: "Invalid data type: categories must be an array." };
    if (categories) { // Validate each category (if provided)
        for (const category of categories as string[]) {
            if (typeof category !== 'string') return { message: 'Each category must be a (string)' };
        }
    }
    if (subcategories && !Array.isArray(subcategories)) return { message: "Invalid data type: subcategories must be an array." };
    if (subcategories) { // Validate each subcategory (if provided)
        for (const subcategory of subcategories as string[]) {
            if (typeof subcategory !== 'string') return { message: 'Each subcategory must be a (string)' };
        }
    }
    if (images && !Array.isArray(images)) return { message: "Invalid data type: images must be an array." };
    if (images) { // Validate each image (if provided)
        for (const image of images as Image[]) {
            if (typeof image.url !== 'string') return { message: 'Each image must have a valid URL (string)' };
            if (typeof image.type !== 'string') return { message: 'Each image must have a valid type (string)' };
            if (typeof image.caption !== 'string') return { message: 'Each image must have a valid caption (string)' };
        }
    }
    if (cost !== undefined && (typeof cost !== 'number' || cost < 0)) return { message: "Invalid cost value: cost must be a non-negative number." };// Validate cost (only if provided)

    return undefined; // If all validations pass
};

// DB data update helpers
// Add or Update Ingredient in the ingredient database
export const handleIngredients = (ingredients: RecipeIngredient[]): RecipeIngredient[] => {
    return ingredients.map(ingredient => {
        let recipeIngredient = ingredientDB.find(i => normalizeString(i.name) === normalizeString(ingredient.name));
        if (recipeIngredient) { // If the ingredient exists, update quantity and unit
            return { ...recipeIngredient, quantity: ingredient.quantity, unit: ingredient.unit };
        } else { // If it doesn't exist, create and add new ingredient to the DB
            const newIngredient: Ingredient = { id: ingredientDB.length + 1, name: ingredient.name };
            ingredientDB.push(newIngredient);
            return { ...newIngredient, quantity: ingredient.quantity, unit: ingredient.unit };
        }
    });
};

// Add or Update Categories in the category database
export const handleCategories = (categories: string[]): Category[] => {
    return categories.map((category: string) => {
        const existingCategory = categoriesDB.find(c => c.name === category);
        if (existingCategory) {
            return existingCategory; // Return existing category
        }
        const newCategory = {
            id: Math.max(...categoriesDB.map(c => c.id), 0) + 1,
            name: category
        };
        categoriesDB.push(newCategory);
        return newCategory;
    });
};

// Add or Update Subcategories in the subcategory database
export const handleSubcategories = (subcategories: string[]): Subcategory[] => {
    return subcategories.map((subcategory: string) => {
        const existingSubcategory = subcategoriesDB.find(s => s.name === subcategory);
        if (existingSubcategory) {
            return existingSubcategory; // Return existing subcategory
        }
        const newSubcategory = {
            id: Math.max(...subcategoriesDB.map(s => s.id), 0) + 1,
            name: subcategory
        };
        subcategoriesDB.push(newSubcategory);
        return newSubcategory;
    });
};

export const handleImages = (images: Image[]) : Image[] => {
    return images.map((image: Image) => {
        const existingImage = imagesDB.find(i => i.url===image.url);
        if (existingImage) {
            return existingImage; // Return existing subcategory
        }
        const newImage = {
            ...image,
            id: Math.max(...imagesDB.map(i => i.id), 0) + 1
        };
        imagesDB.push(newImage);
        return newImage;
    });
}

// Add or Update Region in the region database
export const handleRegion = (region: string, nation: string): string | null => {
    if (!region) return null;

    let updatedRegion = regionsDB.find(r => r.name === region);
    if (!updatedRegion) { // If the region doesn't exist, create a new region
        const newRegion : Region = {
            id: regionsDB.length + 1,
            name: region,
            nations: [nation]
        };
        regionsDB.push(newRegion);
        updatedRegion = newRegion;
    } else {
        if (!updatedRegion.nations.includes(nation)) { // If region exists, check if the nation is already in the region
            updatedRegion.nations.push(nation); // Add the nation if not present
        }
    }
    return updatedRegion.name;
};




//  Get Recipes
// Helper functions for filtering
const filterByCategory = (filtered: Recipe[], category: string) => {
    const queryCategories = category.split(',').map(c => c.trim().toLowerCase());
    return filtered.filter(recipe => 
        recipe.categories?.some(category => queryCategories.includes(category.name.toLowerCase())) ?? false
    );
};
const filterBySubcategory = (filtered: Recipe[], subcategory: string) => {
    const querySubcategories = subcategory.split(',').map(sc => sc.trim().toLowerCase());
    return filtered.filter(recipe => 
        recipe.subcategories?.some(subcategory => querySubcategories.includes(subcategory.name.toLowerCase())) ?? false
    );
};
const filterByNation = (filtered: Recipe[], nation: string) => filtered.filter(recipe => recipe.nation.trim().toLowerCase() === nation.trim().toLowerCase());
const filterByRegion = (filtered: Recipe[], region: string) => filtered.filter(recipe => recipe.region?.toLowerCase() === region.toLowerCase());
const filterByTime = (filtered: Recipe[], time: string) =>  filtered.filter(recipe => recipe.time <= Number(time));
const filterByCost = (filtered: Recipe[], cost: string) => filtered.filter(recipe => recipe.cost !== undefined && recipe.cost <= Number(cost));
const filterBySearch = (filtered: Recipe[], search: string) => filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(search.toLowerCase()) || 
        (recipe.aliases?.some(alias => alias.toLowerCase().includes(search.toLowerCase())) ?? false) ||
        recipe.description.toLowerCase().includes(search.toLowerCase()) ||
        recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(search.toLowerCase()))
    );
const sortRecipes = (filtered: Recipe[], sort: string) => filtered.sort((a, b) => {
        switch (sort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'time':
                return a.time - b.time;
            case 'cost':
                if (a.cost === undefined) return 1; // Recipes without cost come after others
                if (b.cost === undefined) return -1;
                return (a.cost ?? 0) - (b.cost ?? 0);
            default:
                return 0;
        }
    });

// Main endpoint to get all recipes
export const getAllRecipes = (req: Request, res: Response) => {
    let { category, subcategory, nation, region, time, cost, sort, limit = 10, page = 1, search } = req.query;

    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    let filtered: Recipe[] = recipes; // Start with all recipes

    // Filtering logic
    if (category) filtered = filterByCategory(filtered, category as string);
    if (subcategory) filtered = filterBySubcategory(filtered, subcategory as string);
    if (nation) filtered = filterByNation(filtered, nation as string);
    if (region) filtered = filterByRegion(filtered, region as string);
    if (time) filtered = filterByTime(filtered, time as string);
    if (cost) filtered = filterByCost(filtered, cost as string);
    if (search) filtered = filterBySearch(filtered, search as string);
    if (sort) filtered = sortRecipes(filtered, sort as string);
    
    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    // Check if the page is out of range
    if (startIndex >= filtered.length) {
        res.status(200).json({
            totalResults: paginated.length,
            results: [],
        });
    }
    res.status(200).json({
        totalResults: paginated.length,
        results: paginated,
    });
};

// Add A New Recipe
export const addRecipe = (req: Request, res: Response) => {
    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Get user data from the request body

    // Validate the recipe data
    const recipeData = { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost };
    if (!(name && description && nation && ingredients && instructions && time !== undefined)) { // Basic field validation
        res.status(400).json( { message: "Missing required fields: name, description, nation, ingredients, instructions, and time are required." } );
        return;
    }
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Handle ingredients, categories, subcategories, and region
    const recipeIngredients = handleIngredients(ingredients);
    const recipeCategories = categories ? handleCategories(categories) : categories;
    const recipeSubcategories = subcategories ? handleSubcategories(subcategories) : subcategories;
    const recipeRegion = region ? handleRegion(region, nation) : region;

    // Step 5: Create the new recipe object
    const newRecipe: Recipe = {
        id: recipes.length + 1, // Assuming you're generating the ID as the next in the array length
        name,
        description,
        nation,
        region: recipeRegion ? recipeRegion.name : "-", // Use the region name, or default to "-"
        ingredients: recipeIngredients,
        instructions,
        aliases: aliases || [],
        categories: recipeCategories,
        subcategories: recipeSubcategories,
        images: images || [],
        time,
        cost: cost || 0,
    };

    // Save the new recipe (for now, we push it into the dummy recipes array)
    recipes.push(newRecipe);

    // Send response
    res.status(201).json({ message: `New recipe added with id: ${newRecipe.id}` });
};


// Get Recipe by ID
export const getRecipeById = (req:Request, res:Response, next:Function) => {
    const {id} = req.params; // extract id from request params
    if (isNaN(Number(id))) { // Check if the id is a valid number (ID should be numeric) for now, will update when we use proper ids but works ok
        return next(); // If it's not a number, pass to the next route handler
    }

    const recipeId = parseInt(id, 10); // convert id to proper form
    const recipe : Recipe = recipes.find(recipe=>recipe.id===recipeId) as Recipe; // get object if it exists
    if(!recipe){ // return object or 404
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    res.status(200).json(recipe);
}

// Replace Recipe by Id
export const replaceRecipeById = (req: Request, res: Response) => {
    const { id } = req.params; // Extract id from request params
    // Convert ID to number
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) { // Ensure the ID is a valid number
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }

    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Get user data from the request body
    // Validate the recipe data
    const recipeData = { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost };
    if (!(name && description && nation && ingredients && instructions && time !== undefined)) { // Basic field validation
        res.status(400).json( { message: "Missing required fields: name, description, nation, ingredients, instructions, and time are required." } );
        return;
    }
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Find recipe by ID
    const recipeToChangeIndex = recipes.findIndex(recipe => recipe.id === recipeId);
    // Check if recipe exists
    if (recipeToChangeIndex === -1) {
        res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
        return;
    }

    // Handle ingredients, categories, subcategories, and region
    const recipeIngredients = handleIngredients(ingredients);
    const recipeCategories = categories ? handleCategories(categories) : recipes[recipeToChangeIndex].categories;
    const recipeSubcategories = subcategories ? handleSubcategories(subcategories) : recipes[recipeToChangeIndex].subcategories;
    const recipeRegion = region ? handleRegion(region, nation) : recipes[recipeToChangeIndex].region;

    // Step 2: Check if the recipe name already exists (if name should be unique)
    const existingRecipe = recipes.find(recipe => recipe.name === name && recipe.id !== recipeId);
    if (existingRecipe) {
        res.status(400).json({ message: `A recipe with the name '${name}' already exists.` });
        return;
    }

    // Step 3: Create the updated recipe object
    const updatedRecipe: Recipe = {
        id: recipes[recipeToChangeIndex].id,
        name,
        description,
        nation,
        region: recipeRegion ? recipeRegion : recipes[recipeToChangeIndex].region, // Use the region name if available
        ingredients: recipeIngredients,
        instructions,
        aliases: aliases || recipes[recipeToChangeIndex].aliases,
        categories: recipeCategories || recipes[recipeToChangeIndex].categories,
        subcategories: recipeSubcategories || recipes[recipeToChangeIndex].subcategories,
        images: images || recipes[recipeToChangeIndex].images,
        time,
        cost: cost || recipes[recipeToChangeIndex].cost,
    };

    // Save the updated recipe in the array
    recipes[recipeToChangeIndex] = updatedRecipe;

    // Send the updated recipe back in the response
    res.status(200).json(updatedRecipe);
};


// Update Recipe by Id
export const updateRecipeById = (req: Request, res: Response) => {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {  // Ensure the ID is a valid number
        res.status(400).json({ message: 'Invalid ID format' });
        return;
    }

    const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Get user data from the request body
    // Validate the recipe data
    const recipeData = { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost };
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    // Find the recipe to update
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id === recipeId);
    // If recipe is not found, return a 404 error
    if (recipeToUpdateIndex === -1) {
        res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
        return;
    }

    // Handle ingredients, categories, subcategories, and region
    const recipeIngredients = ingredients ? handleIngredients(ingredients) : recipes[recipeToUpdateIndex].ingredients;
    const recipeCategories = categories ? handleCategories(categories) : recipes[recipeToUpdateIndex].categories;
    const recipeSubcategories = subcategories ? handleSubcategories(subcategories) : recipes[recipeToUpdateIndex].subcategories;
    const recipeRegion = region ? handleRegion(region, nation) : recipes[recipeToUpdateIndex].region;

    // Partial update: Only the fields present in the request will be updated
    const updated: Recipe = {
        id: recipes[recipeToUpdateIndex].id,
        name: name || recipes[recipeToUpdateIndex].name,
        description: description || recipes[recipeToUpdateIndex].description,
        nation: nation || recipes[recipeToUpdateIndex].nation,
        region: recipeRegion ? recipeRegion : recipes[recipeToUpdateIndex].region, // Ensure region is updated if provided
        ingredients: recipeIngredients || recipes[recipeToUpdateIndex].ingredients,
        instructions: instructions || recipes[recipeToUpdateIndex].instructions,
        aliases: aliases || recipes[recipeToUpdateIndex].aliases,
        categories: recipeCategories || recipes[recipeToUpdateIndex].categories,
        subcategories: recipeSubcategories || recipes[recipeToUpdateIndex].subcategories,
        images: images || recipes[recipeToUpdateIndex].images,
        time: time || recipes[recipeToUpdateIndex].time,
        cost: cost || recipes[recipeToUpdateIndex].cost,
    };
    // Update the recipe in the array
    recipes[recipeToUpdateIndex] = updated;

    // Respond with the updated recipe
    res.status(200).json({ updated });
};


// Get Recipes with a given name
export const getAllRecipeWithName = (req:Request, res:Response)=>{
    const {name} = req.params;
    let {category, subcategory, nation, region, time, cost, limit = 10, page = 1, sort} = req.query;
    let nameRecipes = recipes.filter(recipe => {
        return recipe.name.toLowerCase()===(name as string).toLowerCase() || (recipe.aliases?.some(alias => alias.toLowerCase()===(name as string).toLowerCase())??false)
    });
    let filtered : Recipe[]= nameRecipes;

    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Filtering logic
    if (category) filtered = filterByCategory(filtered, category as string);
    if (subcategory) filtered = filterBySubcategory(filtered, subcategory as string);
    if (nation) filtered = filterByNation(filtered, nation as string);
    if (region) filtered = filterByRegion(filtered, region as string);
    if (time) filtered = filterByTime(filtered, time as string);
    if (cost) filtered = filterByCost(filtered, cost as string);
    if (sort) filtered = sortRecipes(filtered, sort as string);
    
    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    // Check if the page is out of range
    if (startIndex >= filtered.length) {
        res.status(200).json({
            totalResults: paginated.length,
            results: [],
        });
        return;
    }
    res.status(200).json({
        totalResults: paginated.length,
        results: paginated,
    });
}

// Get Names/Aliases for a Recipe
export const getRecipeNamesById = (req:Request, res:Response)=>{
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    const recipe : Recipe = recipes.find(recipe => recipe.id==recipeId) as Recipe;
    if(!recipe){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    res.status(200).json({
        id:recipeId,
        names:[recipe.name, ...(recipe.aliases || [])]
    });
}

// Replace aliases for a specific Recipe
export const replaceAliasForRecipeById = (req:Request, res:Response)=>{
    const {id} = req.params;
    const {aliases} = req.body; // name is the new name to be added
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id==recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {aliases};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    const updated : Recipe = {
        ...recipes[recipeToUpdateIndex],
        aliases
    }
    recipes[recipeToUpdateIndex] = updated;

    res.status(200).json({
        id:recipeId,
        name:recipes[recipeToUpdateIndex].name,
        aliases:[...(recipes[recipeToUpdateIndex].aliases || [])]
    });
}

// Add a new alias for a specific Recipe
export const addAliasToRecipeById = (req:Request, res:Response)=>{
    const {id} = req.params;
    const {aliases} = req.body; // name is the new name to be added
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id==recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {aliases};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    const updated : Recipe = {
        ...recipes[recipeToUpdateIndex],
        aliases : [...(recipes[recipeToUpdateIndex].aliases || []), ...aliases]
    }
    recipes[recipeToUpdateIndex] = updated;

    res.status(200).json({
        id:recipeId,
        name:recipes[recipeToUpdateIndex].name,
        aliases:[...(recipes[recipeToUpdateIndex].aliases || [])]
    });
}

// Get Ingredients for a specific Recipe
export const getRecipeIngredientsById = (req:Request, res:Response)=>{
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
    if(!recipe){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    res.status(200).json({
        id:recipeId,
        ingredients:recipe.ingredients
    });
}

// Replace Ingredients for a specific Recipe
export const replaceRecipeIngredientsById = (req:Request, res:Response)=>{
    const {id} = req.params;
    const {ingredients} = req.body;
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {ingredients};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    const recipeIngredients = handleIngredients(ingredients);
    const updated : Recipe = {
        ...recipes[recipeToUpdateIndex],
        ingredients: recipeIngredients
    };
    recipes[recipeToUpdateIndex] = updated;

    res.status(200).json(recipes[recipeToUpdateIndex]);
}

// Add new Ingredients for a specific Recipe
export const addRecipeIngredientsById = (req:Request, res:Response) => {
    const {id} = req.params;
    const {ingredients} = req.body;
    
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {ingredients};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    const moreIngredients = handleIngredients(ingredients);
    const updated : Recipe = {
        ...recipes[recipeToUpdateIndex],
        ingredients : [...recipes[recipeToUpdateIndex].ingredients, ...moreIngredients],
    }
    recipes[recipeToUpdateIndex] = updated;
    
    res.status(201).json(recipes[recipeToUpdateIndex]);
}


// helper for specific ingredient updates
// if (typeof ingredient.name !== 'string') return { message: 'Each ingredient must have a valid name' };
const validateIngredient = (ingredient : RecipeIngredient) => { // assumes name is proper
    if (typeof ingredient.quantity !== 'number') return { message: 'Each ingredient must have a valid quantity (number)' };
    if (typeof ingredient.unit !== 'string') return { message: 'Each ingredient must have a valid unit (string)' };
    return undefined;
}

// Update a Recipe Ingredient by Id with Ingredient Id
export const updateRecipeIngredientByIdandIngredientId = (req:Request, res:Response) => {
    const {id, ingredient_id} = req.params;
    const {ingredient} = req.body;
    const {quantity, unit} = ingredient;
    if(!(quantity || unit)){
        res.status(400).json({message:"Missing required fields"});
        return;
    }

    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    const ingredientId = parseInt(ingredient_id, 10);
    const ingredientToUpdateIndex = recipes[recipeToUpdateIndex].ingredients.findIndex(ingredient => ingredient.id===ingredientId);
    if(ingredientToUpdateIndex===-1){
        res.status(404).json({message:`Ingredient with id: ${ingredientId} not found`});
        return;
    }

    const recipeData = { ...ingredient, name:recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex].name};
    const validationResult = validateIngredient(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    const updatedIngredient : RecipeIngredient = {
        ...recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex],
        quantity : quantity || recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex].quantity,
        unit : unit || recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex].unit
    }
    recipes[recipeToUpdateIndex].ingredients[ingredientToUpdateIndex] = updatedIngredient;

    res.status(201).json(recipes[recipeToUpdateIndex].ingredients);
}

// Remove a Recipe Ingredient by Id with Ingredient Id
export const removeRecipeIngredientByIdandIngredientId = (req:Request, res:Response) => {
    const {id, ingredient_id} = req.params;

    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
    }
    const ingredientId = parseInt(ingredient_id, 10);
    const ingredientToUpdateIndex = recipes[recipeToUpdateIndex].ingredients.findIndex(ingredient => ingredient.id===ingredientId);
    if(ingredientToUpdateIndex===-1){
        res.status(404).json({message:`Ingredient with id: ${ingredientId} not found`});
        return;
    }

    const updatedIngredients : RecipeIngredient[] = recipes[recipeToUpdateIndex].ingredients.filter(ingredient => ingredient.id!==ingredientId);
    recipes[recipeToUpdateIndex].ingredients = updatedIngredients;
    res.status(204).json({message:`deleted ingredient with id ${ingredientId}`});
}

// Get the Instructions for a Recipe
export const getRecipeInstructionsById = (req:Request, res:Response) => {
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
    if(!recipe){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    res.status(200).json({
        id:recipeId,
        name:recipe.name,
        instructions:recipe.instructions
    });  
}

// Replace the Instructions for a Recipe
export const replaceRecipeInstructionsById = (req:Request, res:Response) => {
    const {id} = req.params;
    const {instructions} = req.body;
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    console.log(id,recipeId,recipeToUpdateIndex);

    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {instructions};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    const updated : Recipe = {
        ...recipes[recipeToUpdateIndex],
        instructions
    };
    recipes[recipeToUpdateIndex] = updated;
    res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, instructions});

}

// Get all Categories for a Recipe
export const getRecipeCategoriesById = (req:Request, res:Response) => {
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
    if(!recipe){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    res.status(200).json({
        id:recipeId,
        name:recipe.name,
        categories:recipe.categories
    });
}

// Add new Categories to a Recipe
export const addRecipeCategoriesById = (req:Request, res:Response) => {
    const {id} = req.params;
    const {categories} = req.body;
    
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {categories};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    let newCategories = handleCategories(categories);
    const added : Category[] = recipes[recipeToUpdateIndex].categories || [];
    newCategories = newCategories.filter((category: Category) => {
        // Check if the category already exists in 'added' list
        return !added.some(aCategory => aCategory.name === category.name);
    });
    const updated : Recipe = {
        ...recipes[recipeToUpdateIndex],
        categories : [...recipes[recipeToUpdateIndex].categories || [], ...newCategories],
    }
    recipes[recipeToUpdateIndex] = updated;
    
    res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, categories:recipes[recipeToUpdateIndex].categories});
}

// Remove a Category from a Recipe BY Id
export const removeRecipeCategoryByIdandCategoryId = (req:Request, res:Response, next:NextFunction) => {
    const {id, category_id} = req.params;
    console.log(category_id)

    // Check if the id is a valid number (ID should be numeric) for now, will update when we use proper ids but works ok
    if (isNaN(Number(category_id))) {
        return next(); // If it's not a number, pass to the next route handler
    }
    
    const recipeId = parseInt(id, 10);
    const categoryId = parseInt(category_id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    const categoryToDeleteIndex = recipes[recipeToUpdateIndex].categories?.findIndex(category => category.id===categoryId);
    if(categoryToDeleteIndex===-1){
        res.status(404).json({message:`Category with id: ${categoryId} not found`}); 
        return;
    }

    const updatedCategories : Category[] = recipes[recipeToUpdateIndex].categories?.filter(category => category.id!==categoryId) as Category[];
    recipes[recipeToUpdateIndex].categories = updatedCategories;

    res.status(204).json({message:`deleted category with id ${categoryId}`});
}

// Remove a Category from a Recipe By Name
export const removeRecipeCategoryByIdandCategoryName = (req:Request, res:Response) => {
    const {id, category_name} = req.params;
    
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    const categoryToDeleteIndex = recipes[recipeToUpdateIndex].categories?.findIndex(category => normalizeString(category.name)===normalizeString(category_name));
    if(categoryToDeleteIndex===-1){
        res.status(404).json({message:`Category with name: ${category_name} not found`}); 
        return;
    }

    const updatedCategories : Category[] = recipes[recipeToUpdateIndex].categories?.filter(category => normalizeString(category.name)!==normalizeString(category_name)) as Category[];
    recipes[recipeToUpdateIndex].categories = updatedCategories;

    res.status(204).json({message:`deleted category with name ${category_name}`});
}

// Get all Subcategories for a Recipe
export const getRecipeSubcategoriesById = (req:Request, res:Response) => {
    const {id} = req.params;
    const recipeId = parseInt(id, 10);

    const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
    if(!recipe){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    res.status(200).json({
        id:recipeId,
        subcategories:recipe.subcategories
    });
}

// Add new Subcategories to a Recipe
export const addRecipeSubcategoriesById = (req:Request, res:Response) => {
    const {id} = req.params;
    const {subcategories} = req.body;
    
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {subcategories};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    let newSubcategories = handleSubcategories(subcategories);
    const added : Subcategory[] = recipes[recipeToUpdateIndex].subcategories || [];
    newSubcategories = newSubcategories.filter((subcategory: Subcategory) => {
        // Check if the subcategory already exists in 'added' list
        return !added.some(aSubcategory => aSubcategory.name === subcategory.name);
    });
    const updated : Recipe = {
        ...recipes[recipeToUpdateIndex],
        subcategories : [...recipes[recipeToUpdateIndex].subcategories || [], ...newSubcategories],
    }
    recipes[recipeToUpdateIndex] = updated;
    
    res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, subcategories:recipes[recipeToUpdateIndex].subcategories});
}

// Remove a Subcategory from Recipe by Id
export const removeRecipeSubcategoriesByIdandSubcategoryId = (req:Request, res:Response, next:Function) => {
    const {id, subcategory_id} = req.params;
    // Check if the id is a valid number (ID should be numeric) for now, will update when we use proper ids but works ok
    if (isNaN(Number(subcategory_id))) {
        return next(); // If it's not a number, pass to the next route handler
    }
    
    const recipeId = parseInt(id, 10);
    const subcategoryId = parseInt(subcategory_id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    const subcategoryToDeleteIndex = recipes[recipeToUpdateIndex].subcategories?.findIndex(subcategory => subcategory.id===subcategoryId);
    if(subcategoryToDeleteIndex===-1){
        res.status(404).json({message:`Category with id: ${subcategoryId} not found`}); 
        return;
    }

    const updatedSubcategories : Subcategory[] = recipes[recipeToUpdateIndex].subcategories?.filter(subcategory => subcategory.id!==subcategoryId) as Subcategory[];
    recipes[recipeToUpdateIndex].subcategories = updatedSubcategories;

    res.status(204).json({message:`deleted category with id ${subcategoryId}`});
}

// Remove a Subcategory from Recipe by name
export const removeRecipeSubcategoriesByIdandSubcategoryName = (req:Request, res:Response) => {
    const {id, subcategory_name} = req.params;
    
    const recipeId = parseInt(id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    const subcategoryToDeleteIndex = recipes[recipeToUpdateIndex].subcategories?.findIndex(subcategory => normalizeString(subcategory.name)===normalizeString(subcategory_name));
    if(subcategoryToDeleteIndex===-1){
        res.status(404).json({message:`Category with name: ${subcategory_name} not found`}); 
        return;
    }

    const updatedSubcategories : Subcategory[] = recipes[recipeToUpdateIndex].subcategories?.filter(subcategory => normalizeString(subcategory.name)!==normalizeString(subcategory_name)) as Subcategory[];
    recipes[recipeToUpdateIndex].subcategories = updatedSubcategories;

    res.status(204).json({message:`deleted subcategory with name ${subcategory_name}`});
}

// Get Images of Recipe
export const getRecipeImagesById = (req:Request, res:Response) => {
    const {id} = req.params;
    const {limit=10,page=1} = req.query;
    const recipeId = parseInt(id, 10);

    const recipe : Recipe = recipes.find(recipe => recipe.id===recipeId) as Recipe;
    if(!recipe){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    // Apply pagination (limit and page)
    let allImages : Image[] = recipe.images || [];
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginated = allImages.slice(startIndex, endIndex);

    // Check if the page is out of range
    if (startIndex >= allImages.length) {
        res.status(200).json({
            totalResults: paginated.length,
            results: [],
        });
    }

    res.status(200).json({id:recipeId, name:recipe.name, images:paginated});
}

// Add new Images to Recipe
export const addRecipeImageById = (req:Request, res:Response) => {
    const {id} = req.params;
    const {images} = req.body;
    const recipeId = parseInt(id, 10);

    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }

    const recipeData = {images};
    const validationResult = validateRecipeData(recipeData);
    if (validationResult) {
        res.status(400).json(validationResult); // If validation fails, return the error message
        return;
    }

    let newImages = handleImages(images);
    const added : Image[] = recipes[recipeToUpdateIndex].images || [];
    newImages = newImages.filter((image: Image) => {
        // Check if the image already exists in 'added' list
        return !added.some(aImage => aImage.url === image.url);
    });

    const updatedImages : Image[] = [...(recipes[recipeToUpdateIndex].images || []), ...newImages] as Image[];
    recipes[recipeToUpdateIndex].images = updatedImages;

    res.status(201).json({id:recipeId, name:recipes[recipeToUpdateIndex].name, images:recipes[recipeToUpdateIndex].images});
}

// Remove Image of Recipe
export const removeRecipeImageByIdandImageId = (req:Request, res:Response) => {
    const {id, image_id} = req.params;

    const recipeId = parseInt(id, 10);
    const imageId = parseInt(image_id, 10);
    const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id===recipeId);
    if(recipeToUpdateIndex===-1){
        res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
        return;
    }
    const imageToDeleteIndex = recipes[recipeToUpdateIndex].images?.findIndex(image => image.id===imageId);
    if(imageToDeleteIndex===-1){
        res.status(404).json({message:`Image with id: ${image_id} not found`}); 
        return;
    }

    const updatedImages : Image[] = recipes[recipeToUpdateIndex].images?.filter(image => image.id!==imageId) as Image[];
    recipes[recipeToUpdateIndex].images = updatedImages;

    res.status(204).json({message:`deleted image with id ${imageId}`});
}