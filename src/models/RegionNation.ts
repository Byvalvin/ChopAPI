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
    },
    nationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Nation,
        key: 'id',
      },
      allowNull: false,
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
  }
);

export default RegionNation;