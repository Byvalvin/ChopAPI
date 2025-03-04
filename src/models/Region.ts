// models/Region.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection'; // Import the Sequelize instance
import Nation from './Nation'; // Import the Nation model

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

// Many-to-many relationship through the RegionNation junction table
Region.belongsToMany(Nation, { through: 'RegionNation', foreignKey: 'regionId' });

export default Region;
