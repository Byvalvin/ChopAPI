// models/RegionNation.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../DB/connection';
import Region from './Region';
import Nation from './Nation';

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

// Associations
RegionNation.belongsTo(Region, { foreignKey: 'regionId' });
RegionNation.belongsTo(Nation, { foreignKey: 'nationId' });

export default RegionNation;
