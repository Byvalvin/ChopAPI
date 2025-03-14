import swaggerJsdoc from 'swagger-jsdoc';

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
                url: 'http://localhost:3000',
                description: 'Local Development server',
            },
        ],  
    },

    apis: ['src/routes/*.ts',]

};

// Create the OpenAPI specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Log the OpenAPI spec to the console
if(swaggerSpec){
    console.log('Generated OpenAPI Specification');
}else{
    console.error('Error Generation OpenAPI Specifications')
}

export default swaggerSpec;