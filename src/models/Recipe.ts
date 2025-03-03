// import { DataTypes, Model } from 'sequelize';
// import sequelize from '../DB/connection'; // Import the Sequelize instance

// class Recipe extends Model {
//   id!: number;
//   name!: string;
//   description!: string;
//   nation!: string;
//   region!: string | null;
//   instructions!: string[];
//   time!: number;
//   cost!: number | null;
// }

// Recipe.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     nation: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     region: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     instructions: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: false,
//     },
//     time: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     cost: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: 'Recipe',
//     tableName: 'recipes', // This will map to the 'recipes' table in your database
//   }
// );

// export default Recipe;
