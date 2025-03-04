import express from 'express';
import logger from './middleware/logger'; // Import the custom logger
import sequelize from './DB/connection'; // Import the authenticated Sequelize instance
import setupAssociations from './DB/associations';


const app = express();
const baseURL = '/chop/api';

// Add your middleware here
// MIDDLEWARE
app.use(express.json()); // Middleware to parse JSON bodies
app.use(logger); // Use the custom logging middleware

// Check if sequelize is already initialized
if (sequelize) {
  console.log("Attempting to sync...");

  // Add the Sequelize sync logic here
  /* 
   * Use { force: true } only in development to reset the database,
   * Use { alter: true } or migrations in production to avoid losing data and to allow for schema updates without dropping tables.
   */
  setupAssociations();
  sequelize.sync({ force: true }) 
    .then(() => {
      console.log("Database synced!");
      //setupAssociations();
    })
    .catch((error) => {
      console.error("Error syncing database:", error);
    });
} else {
  console.error('Sequelize instance is not initialized(app).');
}

// Add your routes here
// Define your routes here (e.g., for Recipes, Ingredients, etc.)
app.get('/', (req, res) => {
  res.send("Welcome to the ChopAPI");
});

// ROUTES
import recipeRoutes from './routes/recipe'; 
app.use(`${baseURL}/recipes`, recipeRoutes); // RECIPES

// Uncomment and import ingredientRoutes when you need to define them
// import ingredientRoutes from './routes/ingredient'; 
// app.use(`${baseURL}/ingredients`, ingredientRoutes); // INGREDIENTS

export default app;
