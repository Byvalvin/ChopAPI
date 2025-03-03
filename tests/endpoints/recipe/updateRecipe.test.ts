// /tests/endpoints/updateRecipeById.test.ts

import request from 'supertest';
import express from 'express';
import { updateRecipeById } from '../../../src/controllers/recipeController';  // Adjust path if necessary


// Create Express app
const app = express();
app.use(express.json());  // To parse JSON bodies
app.patch('/recipes/:id', updateRecipeById);

describe('PATCH /recipes/:id', () => {
    
    // Test for invalid ingredients (not an array)
    it('should return 400 if ingredients is not an array', async () => {
        const validId = 1;  // ID of the existing recipe
        const invalidIngredients = {
            ingredients: "Not an array"
        };

        const response = await request(app)
            .patch(`/recipes/${validId}`)
            .send(invalidIngredients)
            .expect(400);

        expect(response.body.message).toBe('Ingredients must be an array');
    });

    // Test for invalid instructions (not an array)
    it('should return 400 if instructions is not an array', async () => {
        const validId = 1;  // ID of the existing recipe
        const invalidInstructions = {
            instructions: "Not an array"
        };

        const response = await request(app)
            .patch(`/recipes/${validId}`)
            .send(invalidInstructions)
            .expect(400);

        expect(response.body.message).toBe('Instructions must be an array');
    });

    // Test for invalid time (not a number)
    it('should return 400 if time is not a number', async () => {
        const validId = 1;  // ID of the existing recipe
        const invalidTime = {
            time: "forty-five"
        };

        const response = await request(app)
            .patch(`/recipes/${validId}`)
            .send(invalidTime)
            .expect(400);

        expect(response.body.message).toBe('Time must be a number');
    });

    // Test for invalid cost (not a number)
    it('should return 400 if cost is not a number', async () => {
        const validId = 1;  // ID of the existing recipe
        const invalidCost = {
            cost: "five"
        };

        const response = await request(app)
            .patch(`/recipes/${validId}`)
            .send(invalidCost)
            .expect(400);

        expect(response.body.message).toBe('Cost must be a number');
    });

    // Test for invalid name (not a string)
    it('should return 400 if name is not a string', async () => {
        const validId = 1;  // ID of the existing recipe
        const invalidName = {
            name: 12345
        };

        const response = await request(app)
            .patch(`/recipes/${validId}`)
            .send(invalidName)
            .expect(400);

        expect(response.body.message).toBe('Name must be a string');
    });

    // Test for invalid description (not a string)
    it('should return 400 if description is not a string', async () => {
        const validId = 1;  // ID of the existing recipe
        const invalidDescription = {
            description: 12345
        };

        const response = await request(app)
            .patch(`/recipes/${validId}`)
            .send(invalidDescription)
            .expect(400);

        expect(response.body.message).toBe('Description must be a string');
    });
});
