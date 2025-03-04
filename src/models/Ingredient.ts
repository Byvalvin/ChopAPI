// models/Ingredient.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe';

class Ingredient extends Model {
  id!: number;
  name!: string;
}

Ingredient.init(
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
  },
  {
    sequelize,
    modelName: 'Ingredient',
    tableName: 'ingredients',
  }
);

// Reverse relationship (many-to-many relationship via junction table)
Ingredient.belongsToMany(Recipe, { through: 'RecipeIngredient', foreignKey: 'ingredientId' });
/*
An ingredient can appear in many recipes.
A recipe can have many ingredients.
*/

export default Ingredient;