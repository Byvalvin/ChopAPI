import express from 'express';
import logger from './middleware/logger'; // Import the custom logger
import sequelize from './DB/connection'; // Import the authenticated Sequelize instance
import setupAssociations from './DB/associations';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './openapiDoc';

import path from 'path';
//import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';

const app = express();
const baseURL = '/chop/api';
const openapiDocURL = `${baseURL}/docs`;

// Add your middleware here
// MIDDLEWARE
app.use(express.json()); // Middleware to parse JSON bodies
//app.use(openapiDocURL, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//app.use('/api-docs', swaggerUi.serveFiles(swaggerDoc, options), swaggerUi.setup(swaggerDoc, options));


app.use(logger); // Use the custom logging middleware

// swagger
import swaggerUI from 'swagger-ui-express';
//import swaggerDocument from './swagger.json';
const swaggerUICss = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";

app.use(openapiDocURL,
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, {
        customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
        customCssUrl: swaggerUICss
}))// end of swagger


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
app.get(`${baseURL}`, (req, res) => {
  res.send("Welcome to the ChopAPI!");
});

// ROUTES
import recipeRoutes from './routes/recipe'; 
app.use(`${baseURL}/recipes`, recipeRoutes); // RECIPES

import ingredientRoutes from './routes/ingredient'; 
app.use(`${baseURL}/ingredients`, ingredientRoutes); // INGREDIENTS

import categoryRoutes from './routes/category'; 
app.use(`${baseURL}/categories`, categoryRoutes); // CATEGORIES

import subcategoryRoutes from './routes/subcategory'; 
app.use(`${baseURL}/subcategories`, subcategoryRoutes); // SUBCATEGORIES

import regionRoutes from './routes/region'; 
app.use(`${baseURL}/regions`, regionRoutes); // REGIONS

import nationRoutes from './routes/nation'; 
app.use(`${baseURL}/nations`, nationRoutes); // NATIONS

import authRoutes from './routes/App/auth'; 
app.use(`${baseURL}/auth`, authRoutes); // AUTH

export default app;