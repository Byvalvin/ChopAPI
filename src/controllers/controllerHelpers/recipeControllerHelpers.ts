import { normalizeString } from '../../utils';
import { Recipe as RecipeI, RecipeIngredient as RecipeIngredientI, Image } from '../../interface';
import Recipe from '../../models/Recipe';  // Import the Recipe model
import { Op, Includeable, Sequelize, Transaction } from 'sequelize';
import Ingredient from '../../models/Ingredient';
import RecipeIngredient from '../../models/RecipeIngredient';
import Category from '../../models/Category';
import Subcategory from '../../models/Subcategory';
import Region from '../../models/Region';
import Nation from '../../models/Nation';
import RegionNation from '../../models/RegionNation';
import RecipeCategory from '../../models/RecipeCategory';
import RecipeSubcategory from '../../models/RecipeSubcategory';
import RecipeInstruction from '../../models/RecipeInstruction';
import RecipeAlias from '../../models/RecipeAlias';
import RecipeImage from '../../models/RecipeImage';

import RecipeCache from '../../caching/RecipeCaching'

// Valid columns for sorting
export const validSortFields = ['name', 'time', 'cost'];
export const stdInclude : Includeable[] = [
    { model: Nation, attributes: ['name'], },
    { model: Region, attributes: ['name'], },
    { model: Category,
        through: { attributes: [] }, // Exclude the join table
        attributes: ['name'],
    },
    { model: Subcategory,
        through: { attributes: [] }, // Exclude the join table
        attributes: ['name'],
    },
    { model: RecipeInstruction,
        attributes: ['step', 'instruction'],  // Fetch step and instruction
        order: [['step', 'ASC']], // Ensure they're sorted by step
    },
    { model: RecipeAlias, attributes: ['alias'], },
    { model: RecipeImage, attributes: ['id', 'url', 'type', 'caption'], },
    { model: Ingredient,
        through: { attributes: ['quantity', 'unit'] },
        attributes: ['id','name'],
    },
];

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
        for (const ingredient of ingredients as RecipeIngredientI[]) {
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
            if (!alias || alias.length === 0) return { message: 'Alias cannot be empty string' };
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
            if (image.type && typeof image.type !== 'string') return { message: 'Each image must have a valid type (string)' };
            if (image.caption && typeof image.caption !== 'string') return { message: 'Each image must have a valid caption (string)' };
        }
    }
    if (cost !== undefined && (typeof cost !== 'number' || cost < 0)) return { message: "Invalid cost value: cost must be a non-negative number." };// Validate cost (only if provided)

    return undefined; // If all validations pass
};



// Helper to handle Ingredients (Update or Insert)
export const handleIngredients = async (recipeId: number, ingredients: any[], transaction: Transaction) => {
    for (const ingredient of ingredients) {
        const { name, quantity, unit } = ingredient;
        const normalizedIngredientName: string = normalizeString(name);

        let [existingIngredient, created] = await Ingredient.findOrCreate({
            where: { name: normalizedIngredientName },
            defaults: { name: normalizedIngredientName },
            transaction // Pass the transaction here
        });

        const existingRecipeIngredient = await RecipeIngredient.findOne({
            where: { recipeId, ingredientId: existingIngredient.id },
            transaction
        });

        if (existingRecipeIngredient) {
            if (quantity) await existingRecipeIngredient.update({ quantity }, { transaction });
            if (unit) await existingRecipeIngredient.update({ unit }, { transaction });
        } else {
            await RecipeIngredient.create({
                recipeId,
                ingredientId: existingIngredient.id,
                quantity,
                unit,
            }, { transaction });
        }
    }
};
// Handle Categories (Update or Insert)
export const handleCategories = async (recipeId: number, categories: string[], transaction: Transaction): Promise<void> => {
    for (const category of categories) {
        const categoryName:string = normalizeString(category);
        let [existingCategory] = await Category.findOrCreate({
            where: { name: categoryName },
            defaults: { name: categoryName },
            transaction // Pass the transaction here
        });

        // Check if the RecipeCategory already exists for this recipe
        const existingRecipeCategory = await RecipeCategory.findOne({
            where: { recipeId, categoryId: existingCategory.id },
            transaction // Pass the transaction here
        });

        if (!existingRecipeCategory) {
            // Insert the new RecipeCategory
            await RecipeCategory.create({
                recipeId,
                categoryId: existingCategory.id
            }, { transaction });
        }
    }
};


// Handle Subcategories (Update or Insert)
export const handleSubcategories = async (recipeId: number, subcategories: string[], transaction: Transaction): Promise<void> => { 
    for (const subcategory of subcategories) {
        const subcategoryName:string = normalizeString(subcategory);
        let [existingSubcategory] = await Subcategory.findOrCreate({
            where: { name: subcategoryName },
            defaults: { name: subcategoryName },
            transaction
        });

        // Check if the RecipeSubcategory already exists for this recipe
        const existingRecipeSubcategory = await RecipeSubcategory.findOne({
            where: { recipeId, subcategoryId: existingSubcategory.id },
            transaction
        });

        if (!existingRecipeSubcategory) {
            // Insert the new RecipeSubcategory
            await RecipeSubcategory.create({
                recipeId,
                subcategoryId: existingSubcategory.id
            }, { transaction });
        }
    }
};

// Handle Region (Update or Insert)
export const handleRegionAndNation = async (region: string, nation: string, transaction : Transaction): Promise<{ regionId: number, nationId: number }> => {
    const regionName:string = normalizeString(region), nationName:string = normalizeString(nation);
    let [existingRegion] = await Region.findOrCreate({
        where: { name: regionName },
        defaults: { name: regionName },
        transaction
    });

    let [existingNation] = await Nation.findOrCreate({
        where: { name: nationName },
        defaults: { name: nationName},
        transaction
    });

    // Now, add the region-nation relationship if it doesn't already exist
    const [regionNation, createdRegionNation] = await RegionNation.findOrCreate({
        where: { regionId: existingRegion.id, nationId: existingNation.id },
        transaction
    });
    return { regionId: existingRegion.id, nationId: existingNation.id };
};

// Handle Recipe Instructions (Update or Insert)
export const handleRecipeInstructions = async (recipeId: number, instructions: string[], transaction: Transaction): Promise<void> => {
    if (instructions && instructions.length > 0) { // Loop through the instructions and update or create as needed
        for (const [index, instruction] of instructions.entries()) {
            const existingInstruction = await RecipeInstruction.findOne({
                where: { recipeId, step: index + 1 },
                transaction
            });

            if (existingInstruction) { // Update existing instruction if it exists
                await existingInstruction.update({ instruction }, { transaction });
            } else {
                // Otherwise, create a new instruction
                await RecipeInstruction.create({
                    recipeId,
                    step: index + 1,
                    instruction
                }, { transaction });
            }
        }
    }
};
// Handle Recipe Aliases (Update or Insert)
export const handleRecipeAliases = async (recipeId: number, aliases: string[], transaction: Transaction): Promise<void> => {
    if (aliases && aliases.length > 0) {
        for (const alias of aliases) {
            const existingAlias = await RecipeAlias.findOne({ // Check if the alias already exists for this recipe
                where: { recipeId, alias },
                transaction
            });
            if (!existingAlias) {
                // If the alias doesn't exist, create it
                await RecipeAlias.create({
                    recipeId,
                    alias
                }, { transaction });
            }
        }
    }
};
// Handle Recipe Images (Update or Insert)
export const handleRecipeImages = async (recipeId: number, images: Image[], transaction: Transaction): Promise<void> => {
    if (images && images.length > 0) {
        for (const image of images) {
            const { url, type, caption } = image;
            
            const existingImage = await RecipeImage.findOne({ // Check if the image already exists for this recipe
                where: { recipeId, url },
                transaction
            });
            if (!existingImage) {
                // If the image doesn't exist, create it
                await RecipeImage.create({
                    recipeId,
                    url,
                    type: type || null,
                    caption: caption || null,
                    addedAt: new Date()  // Automatically set the current date for addedAt
                }, { transaction });
            }else{
                await existingImage.update({ url, type:type || null, caption: caption || null, updatedAt: new Date() }, { transaction });
            }
        }
    }
};


export const generateRecipeFilterConditions = (queryParams: any) => {
    const { category, subcategory, nation, region, time, cost, search } = queryParams;
  
    let whereConditions: any = {}; // Initialize the conditions object
    let includeConditions: Includeable[] = []; // Initialize includes for related models
  
    // Add filtering conditions based on query parameters
    if (category) {
        includeConditions.push({
            model: Category,
            through: { attributes: [] }, // Exclude join table attributes
            attributes: ['name'],
            where: { name: normalizeString(category) }, // Apply category filter here
        });
    }

    if (subcategory) {
        includeConditions.push({
            model: Subcategory,
            through: { attributes: [] }, // Exclude join table attributes
            attributes: ['name'],
            where: { name: normalizeString(subcategory) }, // Apply subcategory filter here
        });
    }

    if (nation) {
        includeConditions.push({
            model: Nation,
            attributes: ['name'],
            where: { name: normalizeString(nation) }, // Apply nation filter here
        });
    }

    if (region) {
        includeConditions.push({
            model: Region,
            attributes: ['name'],
            where: { name: normalizeString(region) }, // Apply region filter here
        });
    }

    if (time) {
        whereConditions['time'] = { [Op.lte]: parseInt(time as string, 10) || 0 };  // Use Op for comparison
    }

    if (cost) {
        whereConditions['cost'] = { [Op.lte]: cost };  // Use Op for comparison
    }
  
    // If there's a search term, include additional fields (name and aliases)
    // Add search condition for recipe name and aliases
    if (search) {
        whereConditions[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } }, // Search by recipe name
             // Here, we want to search within aliases using raw SQL
            Sequelize.literal(`
                EXISTS (
                    SELECT 1
                    FROM "recipe_aliases"
                    WHERE "recipe_aliases"."recipeId" = "Recipe"."id"
                    AND "recipe_aliases"."alias" ILIKE '%${search}%'
                ) OR 
                "Recipe"."id" IN (
                    SELECT "recipeId"
                    FROM "recipe_aliases"
                    WHERE "recipe_aliases"."alias" ILIKE '%${search}%'
                )
            `)
        ];

    }

    return { whereConditions, includeConditions };
};


// Refactor the getRecipeDetails function to support dynamic includes and safe access, default include everything(stdInclude)
export const getRecipeDetails = async (recipeId: number, customInclude: Includeable[] = stdInclude) => {
    try {
        const cachedData = await RecipeCache.getCache(recipeId); // Check if recipe is cached
        if (cachedData) { // Return cached data
            return cachedData; 
        }

        // Combine default `stdInclude` with any custom includes provided
        const includeArray = customInclude;

        // Fetch the recipe with the specified includes
        const recipe = await Recipe.findOne({
            where: { id: recipeId },
            include: includeArray,
        });

        if (!recipe) return null;  // Return null if no recipe is found

        // Type assertion to handle associations, we'll make sure the associations are safely accessed
        const typedRecipe = recipe as Recipe & {
            Nation?: { name: string }; // Nation might not be included if not in the query
            Region?: { name: string }; // Same for Region
            RecipeAliases?: { alias: string }[];
            RecipeInstructions?: { step: number; instruction: string }[];
            RecipeImages?: { url: string; type: string; caption: string }[];
            Categories?: { name: string }[];
            Subcategories?: { name: string }[];
            Ingredients?: { name: string; recipe_ingredients: { quantity: number; unit: string } }[];
        };

        const detailedRecipe = {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            nation: typedRecipe.Nation?.name, // Safely access Nation.name
            region: typedRecipe.Region?.name, // Safely access Region.name
            instructions: typedRecipe.RecipeInstructions?.sort((a, b) => a.step - b.step).map((instruction) => instruction.instruction) || [], // Sort by 'step' in ascending order// Map to just the instructions
            categories: typedRecipe.Categories?.map((category: any) => category.name) || [], // Safely map categories
            subcategories: typedRecipe.Subcategories?.map((subcategory: any) => subcategory.name) || [], // Safely map subcategories
            aliases: typedRecipe.RecipeAliases?.map((alias: any) => alias.alias) || [], // Safely map aliases
            images: typedRecipe.RecipeImages?.map((image: any) => ({
                id: image.id,
                url: image.url,
                type: image.type,
                caption: image.caption,
            })) || [], // Safely map images
            time: recipe.time,
            cost: recipe.cost || undefined, // If cost is undefined, it will be omitted
            ingredients: typedRecipe.Ingredients?.map((ingredient: any) => ({
                id: ingredient.id,
                name: ingredient.name,
                quantity: ingredient.recipe_ingredients.dataValues?.quantity, // Safely access recipe_ingredients
                unit: ingredient.recipe_ingredients.dataValues?.unit, // Safely access recipe_ingredients
            })) || [], // Safely map ingredients
        };
        // Cache the recipe details after fetching from DB, update cache since there was no prev cachedData
        await RecipeCache.setCache(recipeId, detailedRecipe as RecipeI); 

        // Return the recipe in the required format, with optional chaining to avoid null errors
        return detailedRecipe;
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching detailed recipe data');
    }
};

