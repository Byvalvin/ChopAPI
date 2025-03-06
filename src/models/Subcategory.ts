// models/Subcategory.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';

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

export default Subcategory;
