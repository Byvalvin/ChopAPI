import express from 'express';
import logger from './middleware/logger'; // Import the custom logger
import sequelize from './DB/connection'; // Import the Sequelize instance
import Recipe from './models/Recipe'; // Import the Recipe model
import Ingredient from './models/Ingredient'; // Import the Ingredient model
import Region from './models/Region';
import Nation from './models/Nation';
import Category from './models/Category';
import Subcategory from './models/Subcategory';
import RecipeAlias from './models/RecipeAlias';
import RecipeIngredient from './models/RecipeIngredient';
import RecipeInstruction from './models/RecipeInstruction';
import RecipeImage from './models/RecipeImage';
import RecipeCategory from './models/RecipeCategory';
import RecipeSubcategory from './models/RecipeSubcategory';
import RegionNation from './models/RegionNation';

const app = express();
const baseURL = '/chop/api';

// Add your middleware here
// MIDDLEWARE
app.use(express.json()); // Middleware to parse JSON bodies
app.use(logger); // Use the custom logging middleware

// Add the Sequelize sync logic here
/*
// Use { force: true } only in development to reset the database, 
// Use { alter: true } or migrations in production to avoid losing data and to allow for schema updates without dropping tables.
*/
sequelize.sync({ force: false }) 
  .then(() => {
    console.log("Database synced!");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

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



/*
sequelize.sync({ force: false })  // Set `force: true` only if you want to reset the database tables
  .then(() => {
    console.log('Database synced successfully!');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// Syncing the database (usually put in a central place like index.ts or server.ts)
sequelize.sync({ force: true }) // WARNING: Drops and recreates tables
  .then(() => {
    console.log("Database synced!");
    // Start your server after the sync is done
    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

*/