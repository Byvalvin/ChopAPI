import pg from "pg"
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Sequelize with your PostgreSQL connection string
const DATABASE_URL = `postgresql://${process.env.DB_USER2}:${process.env.DB_PASSWORD}@${process.env.DB_HOST2}:${process.env.DB_PORT1}/${process.env.DB_NAME}`;
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,  // Optional: Disable SQL query logging
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,  // For remote connections like Supabase
    },
  },
  dialectModule: pg, // add this !
});

// Test connection
console.log('Attempting to authenticate Sequelize connection...');
sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL successful!');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
  

export default sequelize;
