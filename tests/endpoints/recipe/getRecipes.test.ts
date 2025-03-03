// /tests/endpoints/getRecipes.test.ts

import request from 'supertest';
import express from 'express';
import { getAllRecipes } from '../../../src/controllers/recipeController';  // Assuming this is the location of your controller
import { Recipe } from '../../../src/interface';
import { recipes } from '../../../src/data';

// Create an Express app and use the `getAllRecipes` endpoint
const app = express();
app.get('/recipes', getAllRecipes);

// Sample test data (ideally, you'd mock this data or use a real test database)
const sampleRecipes: Recipe[] = recipes;


describe('GET /recipes endpoint', () => {
    it('should return all recipes by default', async () => {
        const response = await request(app).get('/recipes');
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(sampleRecipes.length);  // Assuming this is the number of recipes in your data
        expect(response.body.totalResults).toBe(sampleRecipes.length);
    });

    it('should filter recipes by category', async () => {
        const response = await request(app).get('/recipes').query({ category: 'Italian' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Spaghetti Carbonara is Italian
        expect(response.body.results[0].name).toBe('Spaghetti Carbonara');
    });    

    it('should filter recipes by subcategory', async () => {
        const response = await request(app).get('/recipes').query({ subcategory: 'Pasta' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Only Spaghetti Carbonara matches the subcategory 'Pasta'
        expect(response.body.results[0].name).toBe('Spaghetti Carbonara');
    });    

    it('should filter recipes by nation', async () => {
        const response = await request(app).get('/recipes').query({ nation: 'Mexico' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Only Tacos is from Mexico
        expect(response.body.results[0].name).toBe('Tacos');
    });

    it('should filter recipes by region', async () => {
        const response = await request(app).get('/recipes').query({ region: 'Tijuana' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Only Tacos is from Tijuana
        expect(response.body.results[0].name).toBe('Tacos');
    });    

    it('should filter recipes by time', async () => {
        const response = await request(app).get('/recipes').query({ time: '25' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Only Tacos should be included (time <= 25)
        expect(response.body.results.some((r: Recipe) => r.name === 'Tacos')).toBe(true);
        expect(response.body.results.some((r: Recipe) => r.name === 'Spaghetti Carbonara')).toBe(false); // Spaghetti Carbonara should not be included
    });

    it('should filter recipes by cost', async () => {
        const response = await request(app).get('/recipes').query({ cost: '10' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Only Tacos (cost <= 10) should be included
        expect(response.body.results[0].name).toBe('Tacos'); // Tacos should be the one returned
    });    

    it('should search recipes by name or description', async () => {
        const response = await request(app).get('/recipes').query({ search: 'Spaghetti' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Spaghetti Carbonara should match the search
        expect(response.body.results[0].name).toBe('Spaghetti Carbonara');
    });

    it('should return paginated results', async () => {
        const response = await request(app).get('/recipes').query({ page: '1', limit: '1' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(1);  // Only one result per page
        expect(response.body.totalResults).toBe(sampleRecipes.length);
    });

    it('should return empty results if the page is out of range', async () => {
        const response = await request(app).get('/recipes').query({ page: '100', limit: '1' });
        expect(response.status).toBe(200);
        expect(response.body.results).toHaveLength(0);  // No recipes available for a high page number
        expect(response.body.totalResults).toBe(sampleRecipes.length);
    });    

    it('should sort recipes by name', async () => {
        const response = await request(app).get('/recipes').query({ sort: 'name' });
        expect(response.status).toBe(200);
        expect(response.body.results[0].name).toBe('Spaghetti Carbonara');  // Sorted alphabetically by name
    });

    it('should sort recipes by time', async () => {
        const response = await request(app).get('/recipes').query({ sort: 'time' });
        expect(response.status).toBe(200);
        expect(response.body.results[0].time).toBe(20);  // Tacos should come first (time = 20)
    });

    it('should sort recipes by cost', async () => {
        const response = await request(app).get('/recipes').query({ sort: 'cost' });
        expect(response.status).toBe(200);
        expect(response.body.results[0].cost).toBeLessThanOrEqual(response.body.results[1].cost);  // Sorted by cost
    });
});


