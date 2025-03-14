// models/RecipeSubcategory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe';
import Subcategory from './Subcategory';

class RecipeSubcategory extends Model {
  recipeId!: number;
  subcategoryId!: number;
}

RecipeSubcategory.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id',
      },
      primaryKey: true, // Composite PK (recipeId + subcategoryId)
    },
    subcategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Subcategory,
        key: 'id',
      },
      primaryKey: true, // Composite PK (recipeId + subcategoryId)
    },
  },
  {
    sequelize,
    modelName: 'RecipeSubcategory',
    tableName: 'recipe_subcategories',
    indexes: [
      {
        unique: true,
        fields: ['recipeId', 'subcategoryId'], // Composite unique index for recipeId + subcategoryId
      },
    ],
  }
);

// No need for additional relationships because it's already handled in Recipe and Subcategory
export default RecipeSubcategory;