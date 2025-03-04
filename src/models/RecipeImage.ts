// models/RecipeImage.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe';

class RecipeImage extends Model {
  recipeId!: number;
  url!: string;
  type!: string;
  caption!: string;
  addedAt!: Date;
}

RecipeImage.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: 'id',
      },
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RecipeImage',
    tableName: 'recipe_images',
    indexes: [
      {
        unique: true,
        fields: ['recipeId', 'url'], // Composite unique index for recipeId + url
      },
    ],
  }
);

// Associations
RecipeImage.belongsTo(Recipe, { foreignKey: 'recipeId' });

export default RecipeImage;
