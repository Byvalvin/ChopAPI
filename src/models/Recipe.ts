// models/Recipe.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Region from './Region';
import Nation from './Nation';
import RecipeInstruction from './RecipeInstruction';
import RecipeImage from './RecipeImage';
import RecipeAlias from './RecipeAlias';
import Category from './Category';
import Subcategory from './Subcategory';
import Ingredient from './Ingredient';

class Recipe extends Model {
  id!: number;
  name!: string;
  description!: string;
  nationId!: number;
  regionId!: number;
  time!: number;
  cost!: number | null;
}

Recipe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Nation,
        key: 'id',
      },
    },
    regionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Region,
        key: 'id',
      },
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Recipe',
    tableName: 'recipes',
  }
);

// Associations
Recipe.belongsTo(Nation, { foreignKey: 'nationId' });
Recipe.belongsTo(Region, { foreignKey: 'regionId' });
Recipe.hasMany(RecipeInstruction);
Recipe.hasMany(RecipeImage);
Recipe.hasMany(RecipeAlias);

// Define many-to-many relationship with Category through RecipeCategory
Recipe.belongsToMany(Category, { through: 'RecipeCategory', foreignKey: 'recipeId' });

// Define many-to-many relationship with Subcategory through RecipeSubcategory
Recipe.belongsToMany(Subcategory, { through: 'RecipeSubcategory', foreignKey: 'recipeId' });

// Define many-to-many relationship with Ingredient through RecipeIngredient
Recipe.belongsToMany(Ingredient, { through: 'RecipeIngredient', foreignKey: 'recipeId' });

export default Recipe;
