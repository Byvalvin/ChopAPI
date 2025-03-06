// models/RecipeIngredient.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe';
import Ingredient from './Ingredient';

class RecipeIngredient extends Model {
  recipeId!: number;
  ingredientId!: number;
  amount!: number;
  unit!: string;
}

RecipeIngredient.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id',
      },
      primaryKey: true, // Composite primary key part 1
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Ingredient,
        key: 'id',
      },
      primaryKey: true, // Composite primary key part 2
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RecipeIngredient',
    tableName: 'recipe_ingredients',
    indexes: [
      {
        unique: true,
        fields: ['recipeId', 'ingredientId'], // Composite unique index for recipeId + ingredientId
      },
    ],
  }
);

// No need to define additional relationships because it's handled in Recipe and Ingredient
export default RecipeIngredient;