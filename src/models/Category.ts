// models/Category.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe'; // Importing just for clarity

// Check if the sequelize instance is properly initialized
if (sequelize === null) {
  throw new Error('Sequelize instance is not initialized');
}

class Category extends Model {
  id!: number;
  name!: string;
}

Category.init(
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
    modelName: 'Category',
    tableName: 'categories',
  }
);

  // Category
  //Category.belongsToMany(Recipe, { through: 'RecipeCategory', foreignKey: 'categoryId' });

export default Category;