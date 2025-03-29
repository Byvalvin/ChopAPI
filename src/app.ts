import express from 'express';
import logger from './middleware/logger'; // Import the custom logger
import sequelize from './DB/connection'; // Import the authenticated Sequelize instance
import setupAssociations from './DB/associations';

import swaggerUI from 'swagger-ui-express';
import swaggerSpec, { swaggerUICss } from './documentation/openapiDoc';
import {limiter} from './middleware/rateLimiting';

import path from 'path';

const app = express();
const baseURL = '/chop/api';
const openapiDocURL = `${baseURL}/docs`;
//const swaggerToUse = process.env.IS_DEV==="True" ? 'swaggerLocal.json':'swagger.json'
const swaggerToUse = 'swagger.json';


// Check if sequelize is already initialized
if (sequelize) {
  console.log("Attempting to sync...");

  // Add the Sequelize sync logic here
  /* 
   * Use { force: true } only in development to reset the database,
   * Use { alter: true } or migrations in production to avoid losing data and to allow for schema updates without dropping tables.
   */
  setupAssociations();
  sequelize.sync({ alter: true }) 
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


// Add your middleware here
// MIDDLEWARE

// Middleware to parse JSON bodies
app.use(express.json()); 

// Middleware for rate limiting; Apply this rate limit to all API routes
app.use(`${baseURL}/`, limiter); 

// Middleware(s) for swagger -> to manually Serve the static Swagger JSON file
// app.use(openapiDocURL, swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(  
  openapiDocURL,
  swaggerUI.serve,
  swaggerUI.setup(null, {
    swaggerUrl: '/swagger.json', // Reference the static file
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: swaggerUICss[1], //const swaggerUICss = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";
  })
);
app.use('/swagger.json', (req, res) => res.sendFile(path.join(__dirname, `documentation/${swaggerToUse}`)));

// Middleware for logging; Use the custom logging middleware
app.use(logger); 


// Add your routes here
// Define your routes here (e.g., for Recipes, Ingredients, etc.)

// Redirection logic for the root route
app.get('/', (req, res) => res.redirect(openapiDocURL));
app.get(`${baseURL}`, (req, res) => res.redirect(openapiDocURL));
// app.get(`${baseURL}`, (req, res) => {
//   res.send("Welcome to the ChopAPI!");
// });

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

//references
/*
https://github.com/DarkaOnLine/SwaggerLume/issues/33
https://github.com/DarkaOnLine/L5-Swagger/issues/431
https://medium.com/@vishalvoid/solving-swaggeruibundle-is-not-defined-error-in-express-with-swagger-cdbc3164fd89
https://github.com/fengkx/NodeRSSBot/issues/1662, using pooler?
*/