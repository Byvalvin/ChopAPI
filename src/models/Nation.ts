// models/Nation.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection'; // Import the Sequelize instance
import Region from './Region'; // Import the Region model

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

// Many-to-many relationship through the RegionNation junction table
Nation.belongsToMany(Region, { through: 'RegionNation', foreignKey: 'nationId' });

export default Nation;
