// models/Subcategory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe'; // Import Recipe

// Check if the sequelize instance is properly initialized
if (sequelize === null) {
  throw new Error('Sequelize instance is not initialized');
}

class Subcategory extends Model {
  id!: number;
  name!: string;
}

Subcategory.init(
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
    modelName: 'Subcategory',
    tableName: 'subcategories',
  }
);

// Subcategory
// Subcategory.belongsToMany(Recipe, { through: 'RecipeSubcategory', foreignKey: 'subcategoryId' });


export default Subcategory;
