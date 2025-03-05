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
    Recipe.hasMany(RecipeInstruction);
    Recipe.hasMany(RecipeImage);
    Recipe.hasMany(RecipeAlias);
    Recipe.belongsToMany(Category, { through: 'RecipeCategory', foreignKey: 'recipeId' });
    Recipe.belongsToMany(Subcategory, { through: 'RecipeSubcategory', foreignKey: 'recipeId' });
    Recipe.belongsToMany(Ingredient, { through: 'RecipeIngredient', foreignKey: 'recipeId' });

    // Ingredient
    Ingredient.belongsToMany(Recipe, { through: 'RecipeIngredient', foreignKey: 'ingredientId' });
    
    // Category
    Category.belongsToMany(Recipe, { through: 'RecipeCategory', foreignKey: 'categoryId' });

    // Subcategory
    Subcategory.belongsToMany(Recipe, { through: 'RecipeSubcategory', foreignKey: 'subcategoryId' });

    // RecipeAlias
    RecipeAlias.belongsTo(Recipe, { foreignKey: 'recipeId' });
    // RecipeInstruction
    RecipeInstruction.belongsTo(Recipe, { foreignKey: 'recipeId' });
    // RecipeImage
    RecipeImage.belongsTo(Recipe, { foreignKey: 'recipeId' });

    // Nation
    Nation.belongsToMany(Region, { through: 'RegionNation', foreignKey: 'nationId' });

    // Region
    Region.belongsToMany(Nation, { through: 'RegionNation', foreignKey: 'regionId' });

    // RegionNation
    RegionNation.belongsTo(Region, { foreignKey: 'regionId' });
    RegionNation.belongsTo(Nation, { foreignKey: 'nationId' });

}
