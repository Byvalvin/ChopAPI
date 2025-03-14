// models/Nation.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection'; // Import the Sequelize instance

class Nation extends Model {
  id!: number;
  name!: string;
}

Nation.init(
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
    modelName: 'Nation',
    tableName: 'nations',
  }
);

export default Nation;