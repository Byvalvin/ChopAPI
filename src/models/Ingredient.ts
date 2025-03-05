// models/Ingredient.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';

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

export default Ingredient;