// models/RecipeInstruction.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe';

class RecipeInstruction extends Model {
  recipeId!: number;
  step!: number; // Step number in the recipe (1, 2, 3, etc.)
  instruction!: string; // The instruction text for that step
}

RecipeInstruction.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id',
      },
      allowNull: false,
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    instruction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RecipeInstruction',
    tableName: 'recipe_instructions',
    indexes: [
      {
        unique: true,
        fields: ['recipeId', 'step'], // Composite unique index for recipeId + step
      },
    ],
  }
);

// Associations
RecipeInstruction.belongsTo(Recipe, { foreignKey: 'recipeId' });

export default RecipeInstruction;
