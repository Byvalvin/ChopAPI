import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Region from './Region';  // Ensure Region is fully defined before using it
import Nation from './Nation';  // Ensure Nation is fully defined before using it

class RegionNation extends Model {
  regionId!: number;
  nationId!: number;
}

RegionNation.init(
  {
    regionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Region,
        key: 'id',
      },
      allowNull: false,
      primaryKey: true, // This makes regionId part of the composite primary key
    },
    nationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Nation,
        key: 'id',
      },
      allowNull: false,
      primaryKey: true, // This makes nationId part of the composite primary key
    },
  },
  {
    sequelize,
    modelName: 'RegionNation',
    tableName: 'region_nations',
    indexes: [
      {
        unique: true,
        fields: ['regionId', 'nationId'], // Composite unique index for regionId + nationId
      },
    ],
    // Disable the default id column as you're using composite primary keys
    timestamps: true, // You can keep this if you want to track createdAt/updatedAt
  }
);

export default RegionNation;
