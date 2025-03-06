import { NextFunction, Request,Response  } from 'express';
import { recipes, ingredients as ingredientDB, categories as categoriesDB, subcategories as subcategoriesDB, images as imagesDB,regions as regionsDB } from '../data'; // Importing the simulated DB
// import { Recipe, Region, Ingredient, Category, Subcategory, RecipeIngredient, Image } from '../interface';
import { normalizeString } from '../utils';
import { Recipe as RecipeI, Image } from '../interface';
import Recipe from '../models/Recipe';  // Import the Recipe model
import { Sequelize, Op } from 'sequelize';
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

// Valid columns for sorting
const validSortFields = ['name', 'time', 'cost'];

// Validation Helper
// export const validateRecipeData = (data: any) => {
//     const { name, description, nation, ingredients, instructions, region, aliases, categories, subcategories, images, time, cost } = data;

//     // Basic field validation (only validate required fields if they are present)
//     if (name && typeof name !== 'string') return { message: "Invalid data type: name must be a string." };
//     if (description && typeof description !== 'string') return { message: "Invalid data type: description must be a string." };
//     if (nation && typeof nation !== 'string') return { message: "Invalid data type: nation must be a string." };
    
//     // Validate ingredients and instructions only if provided
//     if (ingredients && !Array.isArray(ingredients)) return { message: "Invalid data type: ingredients must be an array." };
//     if (instructions && !Array.isArray(instructions)) return { message: "Invalid data type: instructions must be an array." };
//     if (instructions) { // Validate each instruction (if provided)
//         for (const instruction of instructions as string[]) {
//             if (typeof instruction !== 'string') return { message: 'Each instruction must have a valid text (string)' };   
//         }
//     }
//     if (ingredients) { // Ensure each ingredient has a valid structure (if provided)
//         for (const ingredient of ingredients as RecipeIngredient[]) {
//             if (typeof ingredient.name !== 'string') return { message: 'Each ingredient must have a valid name' };
//             if (typeof ingredient.quantity !== 'number') return { message: 'Each ingredient must have a valid quantity (number)' };
//             if (typeof ingredient.unit !== 'string') return { message: 'Each ingredient must have a valid unit (string)' };
//         }
//     }
//     if (ingredients && ingredients.length === 0) return { message: "Ingredients cannot be empty." };
//     if (instructions && instructions.length === 0) return { message: "Instructions cannot be empty." };
//     if (time !== undefined && (typeof time !== 'number' || time <= 0)) return { message: "Invalid time value: time must be a positive number." }; // Validate time (only if provided)

//     // Validate optional fields
//     if (region && typeof region !== 'string') return { message: "Invalid data type: region must be a string." };
//     if (aliases && !Array.isArray(aliases)) return { message: "Invalid data type: aliases must be an array." };
//     if (aliases) { // Validate each alias (if provided)
//         for (const alias of aliases as string[]) {
//             if (typeof alias !== 'string') return { message: 'Each alias must be a (string)' };
//         }
//     }
//     if (categories && !Array.isArray(categories)) return { message: "Invalid data type: categories must be an array." };
//     if (categories) { // Validate each category (if provided)
//         for (const category of categories as string[]) {
//             if (typeof category !== 'string') return { message: 'Each category must be a (string)' };
//         }
//     }
//     if (subcategories && !Array.isArray(subcategories)) return { message: "Invalid data type: subcategories must be an array." };
//     if (subcategories) { // Validate each subcategory (if provided)
//         for (const subcategory of subcategories as string[]) {
//             if (typeof subcategory !== 'string') return { message: 'Each subcategory must be a (string)' };
//         }
//     }
//     if (images && !Array.isArray(images)) return { message: "Invalid data type: images must be an array." };
//     if (images) { // Validate each image (if provided)
//         for (const image of images as Image[]) {
//             if (typeof image.url !== 'string') return { message: 'Each image must have a valid URL (string)' };
//             if (typeof image.type !== 'string') return { message: 'Each image must have a valid type (string)' };
//             if (typeof image.caption !== 'string') return { message: 'Each image must have a valid caption (string)' };
//         }
//     }
//     if (cost !== undefined && (typeof cost !== 'number' || cost < 0)) return { message: "Invalid cost value: cost must be a non-negative number." };// Validate cost (only if provided)

//     return undefined; // If all validations pass
// };


// Helper to handle Ingredients (Update or Insert)
export const handleIngredients = async (ingredients: any[], recipeId: number): Promise<void> => {
    for (const ingredient of ingredients) {
        // Normalize the ingredient name
        const normalizedIngredientName = normalizeString(ingredient.name);
        let [existingIngredient, created] = await Ingredient.findOrCreate({
            where: { name: normalizedIngredientName },
            defaults: { name: normalizedIngredientName }
        });

        // Create the RecipeIngredient junction record
        await RecipeIngredient.create({
            recipeId,
            ingredientId: existingIngredient.id,
            quantity: ingredient.quantity,
            unit: ingredient.unit
        });
    }
};

// Handle Categories (Update or Insert)
export const handleCategories = async (recipeId: number, categories: string[]): Promise<void> => {
    for (const category of categories) {
        let [existingCategory] = await Category.findOrCreate({
            where: { name: category },
            defaults: { name: category }
        });

        await RecipeCategory.create({
            recipeId,
            categoryId: existingCategory.id
        });
    }
};

// Handle Subcategories (Update or Insert)
export const handleSubcategories = async (recipeId: number, subcategories: string[]): Promise<void> => {
    for (const subcategory of subcategories) {
        let [existingSubcategory] = await Subcategory.findOrCreate({
            where: { name: subcategory },
            defaults: { name: subcategory }
        });

        await RecipeSubcategory.create({
            recipeId,
            subcategoryId: existingSubcategory.id
        });
    }
};

// Handle Region (Update or Insert)
export const handleRegionAndNation = async (region: string, nation: string): Promise<{ regionId: number, nationId: number }> => {
    let [existingRegion] = await Region.findOrCreate({
        where: { name: region },
        defaults: { name: region }
    });

    let [existingNation] = await Nation.findOrCreate({
        where: { name: nation },
        defaults: { name: nation }
    });

    // Now, add the region-nation relationship if it doesn't already exist
    const [regionNation, createdRegionNation] = await RegionNation.findOrCreate({
        where: { regionId: existingRegion.id, nationId: existingNation.id },
    });
    return { regionId: existingRegion.id, nationId: existingNation.id };
};


export const handleRecipeInstructions = async (recipeId:number, instructions:string[]) : Promise<void> =>{
    if (instructions && instructions.length > 0) {
        // Loop through the instructions array and map each instruction to a step
        await RecipeInstruction.bulkCreate(
            instructions.map((instruction:string, index:number) => ({
                recipeId: recipeId,  // Associate with the newRecipe's ID
                step: index + 1,         // Step number starts from 1
                instruction: instruction
            }))
        );
    }
}
export const handleRecipeAliases = async (recipeId:number, aliases:string[]) : Promise<void> => {
    if (aliases && aliases.length > 0) {
        // For each alias, we create a RecipeAlias entry
        await RecipeAlias.bulkCreate(
            aliases.map((alias:string) => ({
                recipeId: recipeId,  // Associate with the newRecipe's ID
                alias
            }))
        );
    } 
}
export const handleRecipeImages = async (recipeId:number, images:Image[]) : Promise<void> => {
    if (images && images.length > 0) {
        // For each image, ensure it has the correct recipeId and add the current date to `addedAt`
        await RecipeImage.bulkCreate(
            images.map((image:Image) => ({
                recipeId: recipeId,        // Associate with the newRecipe's ID
                url: image.url,                // Image URL (required)
                type: image.type || null,      // Type is optional
                caption: image.caption || null,// Caption is optional
                addedAt: new Date()            // Automatically set the current date for addedAt
            }))
        );
    }
}



// //  Get Recipes
// // Helper functions for filtering
// const filterByCategory = (filtered: Recipe[], category: string) => {
//     const queryCategories = category.split(',').map(c => c.trim().toLowerCase());
//     return filtered.filter(recipe => 
//         recipe.categories?.some(category => queryCategories.includes(category.name.toLowerCase())) ?? false
//     );
// };
// const filterBySubcategory = (filtered: Recipe[], subcategory: string) => {
//     const querySubcategories = subcategory.split(',').map(sc => sc.trim().toLowerCase());
//     return filtered.filter(recipe => 
//         recipe.subcategories?.some(subcategory => querySubcategories.includes(subcategory.name.toLowerCase())) ?? false
//     );
// };
// const filterByNation = (filtered: Recipe[], nation: string) => filtered.filter(recipe => recipe.nation.trim().toLowerCase() === nation.trim().toLowerCase());
// const filterByRegion = (filtered: Recipe[], region: string) => filtered.filter(recipe => recipe.region?.toLowerCase() === region.toLowerCase());
// const filterByTime = (filtered: Recipe[], time: string) =>  filtered.filter(recipe => recipe.time <= Number(time));
// const filterByCost = (filtered: Recipe[], cost: string) => filtered.filter(recipe => recipe.cost !== undefined && recipe.cost <= Number(cost));
// const filterBySearch = (filtered: Recipe[], search: string) => filtered.filter(recipe => 
//         recipe.name.toLowerCase().includes(search.toLowerCase()) || 
//         (recipe.aliases?.some(alias => alias.toLowerCase().includes(search.toLowerCase())) ?? false) ||
//         recipe.description.toLowerCase().includes(search.toLowerCase()) ||
//         recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(search.toLowerCase()))
//     );
// const sortRecipes = (filtered: Recipe[], sort: string) => filtered.sort((a, b) => {
//         switch (sort) {
//             case 'name':
//                 return a.name.localeCompare(b.name);
//             case 'time':
//                 return a.time - b.time;
//             case 'cost':
//                 if (a.cost === undefined) return 1; // Recipes without cost come after others
//                 if (b.cost === undefined) return -1;
//                 return (a.cost ?? 0) - (b.cost ?? 0);
//             default:
//                 return 0;
//         }
//     });


export const getRecipeDetails = async (recipeId: number): Promise<Recipe | null> => {
  try {
    const recipe = await Recipe.findOne({
      where: { id: recipeId },
      include: [
        {
          model: Nation,
          attributes: ['name'], // Fetch only the name of the nation
        },
        {
          model: Region,
          attributes: ['name'],
        },
        {
          model: Category,
          through: { attributes: [] },
          attributes: ['name'],
        },
        {
          model: Subcategory,
          through: { attributes: [] },
          attributes: ['name'],
        },
        {
          model: RecipeInstruction,
          attributes: ['step', 'instruction'],
        },
        {
          model: RecipeAlias,
          attributes: ['alias'],
        },
        {
          model: RecipeImage,
          attributes: ['url', 'type', 'caption'],
        },
        {
          model: Ingredient,
          through: { attributes: ['quantity', 'unit'] },
          attributes: ['name'],
        },
      ],
      //logging: console.log, // Log the SQL query to see what is happening
    });

    if (!recipe) {
      return null;  // Return null if no recipe is found
    }

    // Map the sequelize instance to match the Recipe interface
    // const recipeData: Recipe = {
    //   id: recipe.id,
    //   name: recipe.name,
    //   description: recipe.description,
    //   nation: recipe.Nation?.name || '', // Assuming Nation model has a 'name' field
    //   region: recipe.Region?.name, // Region might be null, so handle that
    //   instructions: recipe.RecipeInstructions?.map((instruction: RecipeInstruction) => instruction.instruction) || [],
    //   categories: recipe.Categories?.map((category: Category) => ({
    //     id: category.id,
    //     name: category.name,
    //   })) || [],
    //   subcategories: recipe.Subcategories?.map((subcategory: Subcategory) => ({
    //     id: subcategory.id,
    //     name: subcategory.name,
    //   })) || [],
    //   aliases: recipe.RecipeAliases?.map((alias: RecipeAlias) => alias.alias) || [],
    //   images: recipe.RecipeImages?.map((image: RecipeImage) => ({
    //     id: image.id,
    //     url: image.url,
    //     type: image.type,
    //     caption: image.caption,
    //   })) || [],
    //   time: recipe.time,
    //   cost: recipe.cost,
    //   ingredients: recipe.Ingredients?.map((ingredient: Ingredient & { RecipeIngredient: RecipeIngredient }) => ({
    //     id: ingredient.id,
    //     name: ingredient.name,
    //     quantity: ingredient.RecipeIngredient?.quantity || 0,
    //     unit: ingredient.RecipeIngredient?.unit || '',
    //   })) || [],
    //   tips: recipe.tips || '', // Optional field, default to empty string if not present
    // };

    //return recipeData;
    return recipe;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching detailed recipe data');
  }
};

  

  // Main endpoint to get all recipes
  export const getAllRecipes = async (req: Request, res: Response) => {
      let { category, subcategory, nation, region, time, cost, sort, limit = 10, page = 1, search } = req.query;
  
      // Validate limit and page to ensure they are numbers and within reasonable bounds
      limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
      page = Math.max(1, Number(page));
  
      // Start with an empty object for where conditions
      let whereConditions: any = {}; // This will hold the dynamic `where` conditions for Sequelize
  
      // Add filtering conditions based on query parameters
      if (category) whereConditions['categories'] = category;
      if (subcategory) whereConditions['subcategories'] = subcategory;
      if (nation) whereConditions['nation'] = nation;
      if (region) whereConditions['region'] = region;
      if (time) whereConditions['time'] = { [Op.lte]: parseInt(time as string, 10) || 0 };  // Use Op for comparison
      if (cost) whereConditions['cost'] = { [Op.lte]: cost };  // Use Op for comparison
      if (search) {
          whereConditions[Op.or] = [
              { name: { [Op.iLike]: `%${search}%` } },
              { description: { [Op.iLike]: `%${search}%` } },
              { '$ingredients.name$': { [Op.iLike]: `%${search}%` } }, // Use correct alias for ingredients
          ];
      }
  
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
                  totalResults: count,
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
              totalResults: count,
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
        await handleIngredients(ingredients, newRecipe.id);
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



// // Get Recipe by ID
// export const getRecipeById = (req:Request, res:Response, next:Function) => {
//     const {id} = req.params; // extract id from request params
//     if (isNaN(Number(id))) { // Check if the id is a valid number (ID should be numeric) for now, will update when we use proper ids but works ok
//         return next(); // If it's not a number, pass to the next route handler
//     }

//     const recipeId = parseInt(id, 10); // convert id to proper form
//     const recipe : Recipe = recipes.find(recipe=>recipe.id===recipeId) as Recipe; // get object if it exists
//     if(!recipe){ // return object or 404
//         res.status(404).json({message:`Recipe with id: ${recipeId} not found`});
//         return;
//     }
//     res.status(200).json(recipe);
// }

// // Replace Recipe by Id
// export const replaceRecipeById = (req: Request, res: Response) => {
//     const { id } = req.params; // Extract id from request params
//     // Convert ID to number
//     const recipeId = parseInt(id, 10);
//     if (isNaN(recipeId)) { // Ensure the ID is a valid number
//         res.status(400).json({ message: "Invalid ID format" });
//         return;
//     }

//     const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Get user data from the request body
//     // Validate the recipe data
//     const recipeData = { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost };
//     if (!(name && description && nation && ingredients && instructions && time !== undefined)) { // Basic field validation
//         res.status(400).json( { message: "Missing required fields: name, description, nation, ingredients, instructions, and time are required." } );
//         return;
//     }
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     // Find recipe by ID
//     const recipeToChangeIndex = recipes.findIndex(recipe => recipe.id === recipeId);
//     // Check if recipe exists
//     if (recipeToChangeIndex === -1) {
//         res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
//         return;
//     }

//     // Handle ingredients, categories, subcategories, and region
//     const recipeIngredients = handleIngredients(ingredients);
//     const recipeCategories = categories ? handleCategories(categories) : recipes[recipeToChangeIndex].categories;
//     const recipeSubcategories = subcategories ? handleSubcategories(subcategories) : recipes[recipeToChangeIndex].subcategories;
//     const recipeRegion = region ? handleRegion(region, nation) : recipes[recipeToChangeIndex].region;

//     // Step 2: Check if the recipe name already exists (if name should be unique)
//     const existingRecipe = recipes.find(recipe => recipe.name === name && recipe.id !== recipeId);
//     if (existingRecipe) {
//         res.status(400).json({ message: `A recipe with the name '${name}' already exists.` });
//         return;
//     }

//     // Step 3: Create the updated recipe object
//     const updatedRecipe: Recipe = {
//         id: recipes[recipeToChangeIndex].id,
//         name,
//         description,
//         nation,
//         region: recipeRegion ? recipeRegion : recipes[recipeToChangeIndex].region, // Use the region name if available
//         ingredients: recipeIngredients,
//         instructions,
//         aliases: aliases || recipes[recipeToChangeIndex].aliases,
//         categories: recipeCategories || recipes[recipeToChangeIndex].categories,
//         subcategories: recipeSubcategories || recipes[recipeToChangeIndex].subcategories,
//         images: images || recipes[recipeToChangeIndex].images,
//         time,
//         cost: cost || recipes[recipeToChangeIndex].cost,
//     };

//     // Save the updated recipe in the array
//     recipes[recipeToChangeIndex] = updatedRecipe;

//     // Send the updated recipe back in the response
//     res.status(200).json(updatedRecipe);
// };


// // Update Recipe by Id
// export const updateRecipeById = (req: Request, res: Response) => {
//     const { id } = req.params;
//     const recipeId = parseInt(id, 10);
//     if (isNaN(recipeId)) {  // Ensure the ID is a valid number
//         res.status(400).json({ message: 'Invalid ID format' });
//         return;
//     }

//     const { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost } = req.body; // Get user data from the request body
//     // Validate the recipe data
//     const recipeData = { name, description, nation, region, ingredients, instructions, aliases, categories, subcategories, images, time, cost };
//     const validationResult = validateRecipeData(recipeData);
//     if (validationResult) {
//         res.status(400).json(validationResult); // If validation fails, return the error message
//         return;
//     }

//     // Find the recipe to update
//     const recipeToUpdateIndex = recipes.findIndex(recipe => recipe.id === recipeId);
//     // If recipe is not found, return a 404 error
//     if (recipeToUpdateIndex === -1) {
//         res.status(404).json({ message: `Recipe with id: ${recipeId} not found` });
//         return;
//     }

//     // Handle ingredients, categories, subcategories, and region
//     const recipeIngredients = ingredients ? handleIngredients(ingredients) : recipes[recipeToUpdateIndex].ingredients;
//     const recipeCategories = categories ? handleCategories(categories) : recipes[recipeToUpdateIndex].categories;
//     const recipeSubcategories = subcategories ? handleSubcategories(subcategories) : recipes[recipeToUpdateIndex].subcategories;
//     const recipeRegion = region ? handleRegion(region, nation) : recipes[recipeToUpdateIndex].region;

//     // Partial update: Only the fields present in the request will be updated
//     const updated: Recipe = {
//         id: recipes[recipeToUpdateIndex].id,
//         name: name || recipes[recipeToUpdateIndex].name,
//         description: description || recipes[recipeToUpdateIndex].description,
//         nation: nation || recipes[recipeToUpdateIndex].nation,
//         region: recipeRegion ? recipeRegion : recipes[recipeToUpdateIndex].region, // Ensure region is updated if provided
//         ingredients: recipeIngredients || recipes[recipeToUpdateIndex].ingredients,
//         instructions: instructions || recipes[recipeToUpdateIndex].instructions,
//         aliases: aliases || recipes[recipeToUpdateIndex].aliases,
//         categories: recipeCategories || recipes[recipeToUpdateIndex].categories,
//         subcategories: recipeSubcategories || recipes[recipeToUpdateIndex].subcategories,
//         images: images || recipes[recipeToUpdateIndex].images,
//         time: time || recipes[recipeToUpdateIndex].time,
//         cost: cost || recipes[recipeToUpdateIndex].cost,
//     };
//     // Update the recipe in the array
//     recipes[recipeToUpdateIndex] = updated;

//     // Respond with the updated recipe
//     res.status(200).json({ updated });
// };


// // Get Recipes with a given name
// export const getAllRecipeWithName = (req:Request, res:Response)=>{
//     const {name} = req.params;
//     let {category, subcategory, nation, region, time, cost, limit = 10, page = 1, sort} = req.query;
//     let nameRecipes = recipes.filter(recipe => {
//         return recipe.name.toLowerCase()===(name as string).toLowerCase() || (recipe.aliases?.some(alias => alias.toLowerCase()===(name as string).toLowerCase())??false)
//     });
//     let filtered : Recipe[]= nameRecipes;

//     // Validate limit and page to ensure they are numbers and within reasonable bounds
//     limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
//     page = Math.max(1, Number(page));

//     // Filtering logic
//     if (category) filtered = filterByCategory(filtered, category as string);
//     if (subcategory) filtered = filterBySubcategory(filtered, subcategory as string);
//     if (nation) filtered = filterByNation(filtered, nation as string);
//     if (region) filtered = filterByRegion(filtered, region as string);
//     if (time) filtered = filterByTime(filtered, time as string);
//     if (cost) filtered = filterByCost(filtered, cost as string);
//     if (sort) filtered = sortRecipes(filtered, sort as string);
    
//     // Pagination logic
//     const startIndex = (page - 1) * limit;
//     const endIndex = startIndex + limit;
//     const paginated = filtered.slice(startIndex, endIndex);

//     // Check if the page is out of range
//     if (startIndex >= filtered.length) {
//         res.status(200).json({
//             totalResults: paginated.length,
//             results: [],
//         });
//         return;
//     }
//     res.status(200).json({
//         totalResults: paginated.length,
//         results: paginated,
//     });
// }

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