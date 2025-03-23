import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist';

// Load environment variables from .env file
dotenv.config();

// Determine the base URL depending on the environment
const serverUrl = process.env.IS_DEV === 'False'
  ? 'https://chop-api-nine.vercel.app'  // Your Vercel deployment URL
  : 'http://localhost:3000';  // Local development URL

const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
const swaggerUICss = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";



// end of swagger
// Define swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chop API',
            version: '1.0.0',
            description: 'API for African & Carribean Cuisine',
            contact: {
                name: 'Byvalvin',
                url: 'https://byvalvin.github.io',
            },
            license: {
                name: 'Licensed Under MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
        },
        servers: [
            {
                url: serverUrl,  // Dynamic URL based on environment
                description: 'API Server',
            },
        ],  
    },

    apis: ['src/routes/*.ts'],  // Path to your route files
    customCssUrl: swaggerUICss,
};





// Create the OpenAPI specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Log the OpenAPI spec to the console
if (swaggerSpec) {
    console.log('Generated OpenAPI Specification');
} else {
    console.error('Error Generating OpenAPI Specification');
}

export default swaggerSpec;
