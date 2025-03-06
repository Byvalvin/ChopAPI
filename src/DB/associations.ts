// DB/associations.ts
import Recipe from '../models/Recipe';
import Ingredient from '../models/Ingredient';
import Region from '../models/Region';
import Nation from '../models/Nation';
import Category from '../models/Category';
import Subcategory from '../models/Subcategory';
import RegionNation from '../models/RegionNation';
import RecipeAlias from '../models/RecipeAlias';
import RecipeInstruction from '../models/RecipeInstruction';
import RecipeImage from '../models/RecipeImage';

export default function setupAssociations() {
    // Recipe
    Recipe.belongsTo(Nation, { foreignKey: 'nationId' });
    Recipe.belongsTo(Region, { foreignKey: 'regionId' });
    Recipe.hasMany(RecipeInstruction, { foreignKey: 'recipeId' }); // Define the association for Recipe -> RecipeInstruction
    Recipe.hasMany(RecipeImage, { foreignKey: 'recipeId' });
    Recipe.hasMany(RecipeAlias, { foreignKey: 'recipeId' });
    Recipe.belongsToMany(Category, { through: 'recipe_categories', foreignKey: 'recipeId' });
    Recipe.belongsToMany(Subcategory, { through: 'recipe_subcategories', foreignKey: 'recipeId' });
    Recipe.belongsToMany(Ingredient, { through: 'recipe_ingredients', foreignKey: 'recipeId' });

    // Ingredient
    Ingredient.belongsToMany(Recipe, { through: 'recipe_ingredients', foreignKey: 'ingredientId' });
    
    // Category
    Category.belongsToMany(Recipe, { through: 'recipe_categories', foreignKey: 'categoryId' });

    // Subcategory
    Subcategory.belongsToMany(Recipe, { through: 'recipe_subcategories', foreignKey: 'subcategoryId' });

    // RecipeAlias
    RecipeAlias.belongsTo(Recipe, { foreignKey: 'recipeId' });
    // RecipeInstruction
    RecipeInstruction.belongsTo(Recipe, { foreignKey: 'recipeId' });
    // RecipeImage
    RecipeImage.belongsTo(Recipe, { foreignKey: 'recipeId' });

    // Nation
    
    Nation.hasMany(Recipe, { foreignKey: 'nationId' }); // Nation has many Recipes (in reverse association)
    Nation.belongsToMany(Region, { through: 'RegionNation', foreignKey: 'nationId' });

    // Region
    Region.hasMany(Recipe, { foreignKey: 'regionId' }); // Region has many Recipes (in reverse association)
    Region.belongsToMany(Nation, { through: 'RegionNation', foreignKey: 'regionId' });

    // RegionNation
    RegionNation.belongsTo(Region, { foreignKey: 'regionId' });
    RegionNation.belongsTo(Nation, { foreignKey: 'nationId' });

    console.log("Associations setup!");

}
