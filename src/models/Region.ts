import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection'; // Import the Sequelize instance

class Region extends Model {
  id!: number;
  name!: string;
}

Region.init(
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
    modelName: 'Region',
    tableName: 'regions',
  }
);

export default Region;