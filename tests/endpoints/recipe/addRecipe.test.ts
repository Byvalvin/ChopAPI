// /tests/endpoints/addRecipe.test.ts

import request from 'supertest';
import express from 'express';
import { addRecipe } from '../../../src/controllers/recipeController';  // Adjust path if necessary

// Your existing recipes data
import { recipes } from '../../../src/data';  // Adjust path if necessary

// Create an Express app and use the `addRecipe` endpoint
const app = express();
app.use(express.json());  // Middleware to parse JSON body
app.post('/recipes', addRecipe);

describe('POST /recipes', () => {
    
    // Test case for adding a new recipe successfully
    it('should add a new recipe and return a success message', async () => {
        const newRecipe = {
            name: 'Chicken Alfredo',
            description: 'Creamy pasta with chicken and Alfredo sauce',
            nation: 'Italy',
            region: 'Naples',
            ingredients: [
                { id: 1, name: 'Fettuccine', quantity: '200', unit: 'grams' },
                { id: 2, name: 'Chicken breast', quantity: '2', unit: 'pieces' },
                { id: 3, name: 'Cream', quantity: '100', unit: 'ml' },
            ],
            instructions: [
                { step: 1, text: 'Boil the fettuccine in salted water.' },
                { step: 2, text: 'Cook chicken breast until golden brown.' },
                { step: 3, text: 'Mix cooked chicken and fettuccine with cream.' },
                { step: 4, text: 'Serve with grated parmesan cheese.' },
            ],
            time: 30,
            cost: 12,
        };
        const currentRecipeLength = recipes.length;

        const response = await request(app)
            .post('/recipes')
            .send(newRecipe)
            .expect(201);  // Expect a 201 status code (Created)

        expect(response.body.message).toBe(`New recipe added with id: ${currentRecipeLength + 1}`);
    });

    // Test case for missing required fields (e.g., description)
    it('should return an error if required fields are missing', async () => {
        const newRecipe = { // Missing description
            name: 'Fried Rice',
            nation: 'China',
            ingredients: [
                { id: 1, name: 'Rice', quantity: '200', unit: 'grams' },
                { id: 2, name: 'Vegetables', quantity: '100', unit: 'grams' },
            ],
            instructions: [
                { step: 1, text: 'Fry the rice in a pan.' },
                { step: 2, text: 'Add vegetables and stir-fry.' },
            ],
            time: 20,
        };

        const response = await request(app)
            .post('/recipes')
            .send(newRecipe)
            .expect(400);  // Expect a 400 status code (Bad Request)

        expect(response.body.message).toBe('Missing required fields: name, description, nation, ingredients, instructions, and time are required.');
    });

    // Test case for invalid data types (e.g., name is not a string)
    it('should return an error if fields have invalid data types', async () => {
        const newRecipe = {
            name: 123,  // Invalid data type (should be string)
            description: 'A simple dish',
            nation: 'Japan',
            ingredients: [{ id: 1, name: 'Rice', quantity: '200', unit: 'grams' }],
            instructions: [{ step: 1, text: 'Cook rice.' }],
            time: 15,
        };

        const response = await request(app)
            .post('/recipes')
            .send(newRecipe)
            .expect(400);  // Expect a 400 status code

        expect(response.body.message).toBe('Invalid data type: name, description, and nation must be strings.');
    });

    // Test case for missing required array fields (e.g., ingredients)
    it('should return an error if ingredients or instructions are missing or empty', async () => {
        const newRecipe = {
            name: 'Veggie Soup',
            description: 'Healthy vegetable soup',
            nation: 'USA',
            ingredients: [],  // Empty array
            instructions: [{ step: 1, text: 'Boil the vegetables.' }],
            time: 25,
        };

        const response = await request(app)
            .post('/recipes')
            .send(newRecipe)
            .expect(400);  // Expect a 400 status code

        expect(response.body.message).toBe('Ingredients and instructions cannot be empty.');
    });

    // Test case for invalid cost value (e.g., negative cost)
    it('should return an error if cost is a negative number', async () => {
        const newRecipe = {
            name: 'Beef Stew',
            description: 'Hearty beef stew with vegetables',
            nation: 'USA',
            ingredients: [{ id: 1, name: 'Beef', quantity: '500', unit: 'grams' }],
            instructions: [{ step: 1, text: 'Cook beef with vegetables.' }],
            time: 40,
            cost: -8,  // Invalid (negative cost)
        };

        const response = await request(app)
            .post('/recipes')
            .send(newRecipe)
            .expect(400);  // Expect a 400 status code

        expect(response.body.message).toBe('Invalid cost value: cost must be a non-negative number.');
    });

    // Test case for invalid time value (e.g., non-positive time)
    it('should return an error if time is not a positive number', async () => {
        const newRecipe = {
            name: 'Quick Salad',
            description: 'Simple salad with vegetables',
            nation: 'USA',
            ingredients: [{ id: 1, name: 'Lettuce', quantity: '100', unit: 'grams' }],
            instructions: [{ step: 1, text: 'Toss the vegetables together.' }],
            time: 0,  // Invalid time (zero)
            cost: 5,
        };

        const response = await request(app)
            .post('/recipes')
            .send(newRecipe)
            .expect(400);  // Expect a 400 status code

        expect(response.body.message).toBe('Invalid time value: time must be a positive number.');
    });

});
