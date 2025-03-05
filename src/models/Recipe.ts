// models/Recipe.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Region from './Region';
import Nation from './Nation';


class Recipe extends Model {
  id!: number;
  name!: string;
  description!: string;
  nationId!: number;
  regionId!: number;
  time!: number;
  cost!: number | null;
}

Recipe.init(
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Nation,
        key: 'id',
      },
    },
    regionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Region,
        key: 'id',
      },
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Recipe',
    tableName: 'recipes',
  }
);

export default Recipe;
