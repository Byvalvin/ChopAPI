// models/Subcategory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Recipe from './Recipe'; // Import Recipe

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

// Reverse relationship (many-to-many relationship via junction table)
Subcategory.belongsToMany(Recipe, { through: 'RecipeSubcategory', foreignKey: 'subcategoryId' });

export default Subcategory;
