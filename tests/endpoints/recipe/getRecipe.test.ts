// /tests/endpoints/getRecipe.test.ts

import request from 'supertest';
import express from 'express';
import { getRecipeById } from '../../../src/controllers/recipeController';  // Adjust path if necessary

// Import the recipes array
import { recipes } from '../../../src/data';  // Adjust path if necessary

// Create Express app
const app = express();
app.get('/recipes/:id', getRecipeById);

describe('GET /recipes/:id', () => {
    
    // Test case for getting a recipe by valid ID
    it('should return the recipe when given a valid ID', async () => {
        const validId = 1;  // Assuming a valid ID (e.g., for "Spaghetti Carbonara")
        
        const response = await request(app)
            .get(`/recipes/${validId}`)
            .expect(200);  // Expect a 200 status code (OK)
        
        expect(response.body).toEqual({
            id: 1,
            name: 'Spaghetti Carbonara',
            description: 'A classic Roman pasta dish.',
            nation: 'Italy',
            region: 'Rome',
            time: 30,
            cost: 15,
            instructions: [
                { step: 1, text: 'Boil the spaghetti according to the package instructions.' },
                { step: 2, text: 'Fry the pancetta in a pan until crispy.' },
                { step: 3, text: 'Mix the eggs with cheese and season with salt and pepper.' },
                { step: 4, text: 'Combine the cooked spaghetti with the pancetta and egg mixture.' },
                { step: 5, text: 'Serve with additional cheese and pepper on top.' }
            ],
            categories: [{ id: 1, name: 'Italian' }],
            subcategories: [{ id: 1, name: 'Pasta' }],
            aliases: ["Spaghetti"],
            images: [
                {
                    id: 1,
                    url: "https://example.com/image3.jpg",
                    type: "thumbnail",
                    caption: "Spag Image 1"
                },
            ],
            ingredients: [
                { id: 1, name: 'Spaghetti', quantity: '200', unit: 'grams' },
                { id: 2, name: 'Eggs', quantity: '4', unit: 'pieces' },
                { id: 3, name: 'Pancetta', quantity: '100', unit: 'grams' }
            ]
        });
    });

    // Test case for invalid ID (ID does not exist)
    it('should return a 404 error when the recipe ID does not exist', async () => {
        const invalidId = 999;  // ID that does not exist
        
        const response = await request(app)
            .get(`/recipes/${invalidId}`)
            .expect(404);  // Expect a 404 status code (Not Found)

        expect(response.body.message).toBe('Recipe with id: 999 not found');
    });

});
