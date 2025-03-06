// models/Category.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';

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

export default Category;