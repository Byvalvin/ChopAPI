// models/Category.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe'; // Importing just for clarity

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

// Reverse relationship (many-to-many relationship via junction table)
Category.belongsToMany(Recipe, { through: 'RecipeCategory', foreignKey: 'categoryId' });

export default Category;