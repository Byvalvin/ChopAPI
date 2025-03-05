// models/RecipeAlias.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe';

class RecipeAlias extends Model {
  recipeId!: number;
  alias!: string;
}

RecipeAlias.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id',
      },
      allowNull: false,
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'RecipeAlias',
    tableName: 'recipe_aliases',
    indexes: [
      {
        unique: true,
        fields: ['recipeId', 'alias'], // Composite unique index for recipeId + alias
      },
    ],
  }
);

export default RecipeAlias;
