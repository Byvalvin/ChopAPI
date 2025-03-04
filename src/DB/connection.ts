import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// // Load environment variables from .env file
dotenv.config();

const sequelize = new Sequelize(`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
  dialect: 'postgres',
  logging: false,  // Optional: Disable SQL query logging
});



// Test connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to Supabase PostgreSQL successful!');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

export default sequelize;








// // Create the connection using the environment variables
// const sequelize = new Sequelize({
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     dialect: 'postgres',
//     port: 5432,  // Default PostgreSQL port
//   });

// // Test the connection
// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection to Supabase PostgreSQL successful!');
//   })
//   .catch((error) => {
//     console.error('Unable to connect to the database:', error);
//   });

// export default sequelize;

