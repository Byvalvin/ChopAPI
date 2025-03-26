import pg from "pg"
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const {DB_USER1, DB_USER2, DB_PASSWORD, DB_HOST1, DB_HOST2, DB_PORT1, DB_PORT2, DB_NAME, IS_DEV} = process.env;
// Initialize Sequelize with your PostgreSQL connection string
const DATABASE_URL = { 
  "Direct":`postgresql://${DB_USER1}:${DB_PASSWORD}@${DB_HOST1}:${DB_PORT1}/${DB_NAME}`,
  "Transaction_Pooler":`postgresql://${DB_USER2}:${DB_PASSWORD}@${DB_HOST2}:${DB_PORT2}/${DB_NAME}`,
  "Session_Pooler":`postgresql://${DB_USER2}:${DB_PASSWORD}@${DB_HOST2}:${DB_PORT1}/${DB_NAME}`
};
const urlToUse = IS_DEV==="True"? "Session_Pooler" : "Transaction_Pooler";
const sequelize = new Sequelize(DATABASE_URL[urlToUse], {
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
