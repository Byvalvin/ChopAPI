import express from 'express';
import logger from './middleware/logger'; // Import the custom logger
import sequelize from './DB/connection'; // Import the authenticated Sequelize instance
import setupAssociations from './DB/associations';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './openapiDoc';
import path from 'path';
const { SwaggerUIBundle, SwaggerUIStandalonePreset } = require('swagger-ui-dist');


const app = express();
const baseURL = '/chop/api';
const openapiDocURL = `${baseURL}/docs`;

// Add your middleware here
// MIDDLEWARE
app.use(express.json()); // Middleware to parse JSON bodies
// Serve Swagger UI assets directly from the 'swagger-ui-dist' folder
app.use('/swagger-ui', express.static(path.join(__dirname, 'node_modules', 'swagger-ui-dist')));

// Serve Swagger UI at the /docs route
app.use(openapiDocURL, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: `${baseURL}/swagger.json`,  // Point to the generated swagger JSON spec
  },
}));
app.use(logger); // Use the custom logging middleware


// Serve the OpenAPI spec as JSON at the /swagger.json route
app.get(`${baseURL}/swagger.json`, (req, res) => {
  res.json(swaggerSpec);  // Serve the generated Swagger spec
});


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