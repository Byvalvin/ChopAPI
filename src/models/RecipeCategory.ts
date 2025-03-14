// models/RecipeCategory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe';
import Category from './Category';

class RecipeCategory extends Model {
  recipeId!: number;
  categoryId!: number;
}

RecipeCategory.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id',
      },
      primaryKey: true, // Composite PK (recipeId + categoryId)
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: 'id',
      },
      primaryKey: true, // Composite PK (recipeId + categoryId)
    },
  },
  {
    sequelize,
    modelName: 'RecipeCategory',
    tableName: 'recipe_categories',
    indexes: [
      {
        unique: true,
        fields: ['recipeId', 'categoryId'], // Composite unique index for recipeId + categoryId
      },
    ],
  }
);

// No need to define additional relationships because it's already handled in Recipe and Category
export default RecipeCategory;