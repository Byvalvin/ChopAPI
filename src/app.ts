import express from 'express';
import logger from './middleware/logger'; // Import the custom logger


// import sequelize from './DB/connection';  // Import the Sequelize instance
// import Recipe from './models/Recipe';  // Import the Recipe model
// import Ingredient from './models/Ingredient';  // Import the Ingredient model


// sequelize.sync({ force: false })  // Set `force: true` only if you want to reset the database tables
//   .then(() => {
//     console.log('Database synced successfully!');
//   })
//   .catch((error) => {
//     console.error('Error syncing database:', error);
//   });


const app = express();
const baseURL = '/chop/api';

//Add your middleware here
//MIDDLEWARE
app.use(express.json()); // Middleware to parse JSON bodies
app.use(logger);  // // Use the custom logging middleware,This will log every request and response

// Add your routes here
//ROUTES
import recipeRoutes from './routes/recipe'; 
app.use(`${baseURL}/recipes`, recipeRoutes); //RECIPES

// import ingredientRoutes from './routes/ingredient'; 
// app.use(`${baseURL}/ingredients`, ingredientRoutes); //INGREDIENTS

export default app;


