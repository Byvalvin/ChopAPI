import swaggerJsdoc from 'swagger-jsdoc';

// Define swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chop API',
            version: '1.0.0',
            description: 'API for managing recipes, ingredients, categories, etc.',
            contact: {
            name: 'Your Name',
            url: 'https://yourwebsite.com',
            email: 'youremail@example.com',
            },
            license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],  
    },

    apis: ['src/routes/*.ts',]

};

// Create the OpenAPI specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Log the OpenAPI spec to the console
console.log('Generated OpenAPI Specification: ', JSON.stringify(swaggerSpec, null, 2));

export default swaggerSpec;