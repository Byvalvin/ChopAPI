// /tests/endpoints/replaceRecipeById.test.ts

import request from 'supertest';
import express from 'express';
import { replaceRecipeById } from '../../../src/controllers/recipeController';  // Adjust path if necessary

// Create Express app
const app = express();
app.use(express.json());  // To parse JSON bodies
app.put('/recipes/:id', replaceRecipeById);

describe('PUT /recipes/:id', () => {

    // Test case for successfully updating a recipe
    it('should update the recipe when given a valid ID and valid fields', async () => {
        const validId = 1;  // ID of the existing recipe (e.g., "Spaghetti Carbonara")
        const updatedRecipe = {
            name: 'Updated Spaghetti Carbonara',
            description: 'An updated classic Roman pasta dish.',
            nation: 'Italy',
            ingredients: [
                { id: 1, name: 'Spaghetti', quantity: '200', unit: 'grams' },
                { id: 2, name: 'Eggs', quantity: '4', unit: 'pieces' },
                { id: 3, name: 'Pancetta', quantity: '120', unit: 'grams' }
            ],
            instructions: [
                { step: 1, text: 'Boil the spaghetti.' },
                { step: 2, text: 'Fry the pancetta.' },
                { step: 3, text: 'Mix with eggs and cheese.' }
            ],
            time: 35,
            cost: 20
        };

        const response = await request(app)
            .put(`/recipes/${validId}`)
            .send(updatedRecipe)
            .expect(200);  // Expect a 200 status code (OK)

        expect(response.body.name).toBe(updatedRecipe.name);
        expect(response.body.description).toBe(updatedRecipe.description);
        expect(response.body.ingredients).toEqual(updatedRecipe.ingredients);
        expect(response.body.instructions).toEqual(updatedRecipe.instructions);
        expect(response.body.time).toBe(updatedRecipe.time);
        expect(response.body.cost).toBe(updatedRecipe.cost);
    });

    // Test case for missing required fields
    it('should return a 400 error if required fields are missing', async () => {
        const validId = 1;  // ID of the existing recipe
        const incompleteRecipe = {  // Missing "name" and "ingredients"
            description: 'An incomplete recipe update',
            nation: 'Italy',
            time: 30
        };

        const response = await request(app)
            .put(`/recipes/${validId}`)
            .send(incompleteRecipe)
            .expect(400);  // Expect a 400 status code (Bad Request)

        expect(response.body.message).toBe('Missing required fields');
    });

    // Test case for non-existent recipe ID
    it('should return a 404 error if the recipe ID does not exist', async () => {
        const invalidId = 999;  // Non-existent ID
        
        const response = await request(app)
            .put(`/recipes/${invalidId}`)
            .send({
                name: 'Updated Recipe',
                description: 'This should fail because the ID is invalid',
                nation: 'Italy',
                ingredients: [{ id: 1, name: 'Ingredient', quantity: '100', unit: 'grams' }],
                instructions: [{ step: 1, text: 'Cook something' }],
                time: 20
            })
            .expect(404);  // Expect a 404 status code (Not Found)

        expect(response.body.message).toBe(`Recipe with id: ${invalidId} not found`);
    });

    // Test case for invalid ID format (non-numeric ID)
    it('should return a 400 error if the ID is not a valid number', async () => {
        const invalidId = 'abc';  // Non-numeric ID
        
        const response = await request(app)
            .put(`/recipes/${invalidId}`)
            .send({
                name: 'Updated Recipe',
                description: 'This should fail because the ID is not numeric',
                nation: 'Italy',
                ingredients: [{ id: 1, name: 'Ingredient', quantity: '100', unit: 'grams' }],
                instructions: [{ step: 1, text: 'Cook something' }],
                time: 20
            })
            .expect(400);  // Expect a 400 status code (Bad Request)

        expect(response.body.message).toBe('Invalid ID format');
    });

    // Test case for invalid 'time' field
    it('should return a 400 error if the time is not a valid number', async () => {
        const validId = 1;
        const invalidRecipe = {
            name: 'Updated Recipe',
            description: 'This should fail because time is invalid',
            nation: 'Italy',
            ingredients: [{ id: 1, name: 'Ingredient', quantity: '100', unit: 'grams' }],
            instructions: [{ step: 1, text: 'Cook something' }],
            time: -10,  // Invalid time value
        };

        const response = await request(app)
            .put(`/recipes/${validId}`)
            .send(invalidRecipe)
            .expect(400);  // Expect a 400 status code (Bad Request)

        expect(response.body.message).toBe('Time must be a positive number');
    });
});
