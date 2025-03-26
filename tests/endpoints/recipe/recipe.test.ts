import supertest from 'supertest';
import app from '../../../src/app';  // Import your express app
import Recipe from '../../../src/models/Recipe';

const request = supertest(app);  // Create a supertest instance for making API calls

describe('GET /recipes', () => {
    it('should return recipes with the correct filtering', async () => {
      const res = await request.get('/recipes').query({
        category: 'African',  // Adjust query params based on the actual implementation
        limit: 10,
        page: 1
      });
  
      expect(res.status).toBe(200);
      expect(res.body.results.length).toBeGreaterThan(0);  // Ensure it returns results
      expect(res.body.totalResults).toBeGreaterThan(0);  // Ensure total results are positive
    });
  
    it('should return 400 if query params are invalid', async () => {
      const res = await request.get('/recipes').query({ limit: -1 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });
  });


//   describe('POST /recipes', () => {
//     it('should add a new recipe successfully', async () => {
//       const newRecipe = {
//         name: 'Jollof Rice',
//         description: 'Delicious African rice dish.',
//         nation: 'Nigeria',
//         region: 'West Africa',
//         ingredients: ['rice', 'tomato', 'pepper'],
//         instructions: ['Cook rice', 'Prepare sauce', 'Mix'],
//         aliases: ['Jollof'],
//         categories: ['African'],
//         subcategories: ['Rice Dishes'],
//         images: [{ url: 'image-url' }],
//         time: 45,
//         cost: 10
//       };
  
//       const res = await request.post('/recipes').send(newRecipe);
  
//       expect(res.status).toBe(201);
//       expect(res.body.message).toContain('Recipe added with ID');
//     });
  
//     it('should return 400 if required fields are missing', async () => {
//       const incompleteRecipe = {
//         name: 'Jollof Rice',
//         description: 'Delicious African rice dish.',
//         nation: 'Nigeria',
//         region: 'West Africa',
//         ingredients: ['rice', 'tomato'],
//         instructions: ['Cook rice', 'Prepare sauce'],
//         time: 45,
//       };
  
//       const res = await request.post('/recipes').send(incompleteRecipe);
  
//       expect(res.status).toBe(400);
//       expect(res.body.message).toBe('Missing required fields');
//     });
//   });
  

//   describe('GET /recipes/:id', () => {
//     it('should return recipe details for a valid ID', async () => {
//       const recipe = await Recipe.create({
//         name: 'Jollof Rice',
//         description: 'Delicious African rice dish.',
//         nation: 'Nigeria',
//         region: 'West Africa',
//         time: 45,
//         cost: 10
//       });
  
//       const res = await request.get(`/recipes/${recipe.id}`);
  
//       expect(res.status).toBe(200);
//       expect(res.body.name).toBe('Jollof Rice');
//     });
  
//     it('should return 404 for a non-existent recipe ID', async () => {
//       const res = await request.get('/recipes/999999');
//       expect(res.status).toBe(404);
//       expect(res.body.message).toBe('Recipe with id: 999999 not found');
//     });
//   });


//   describe('PUT /recipes/:id', () => {
//     it('should update an existing recipe successfully', async () => {
//       const recipe = await Recipe.create({
//         name: 'Jollof Rice',
//         description: 'Delicious African rice dish.',
//         nation: 'Nigeria',
//         region: 'West Africa',
//         time: 45,
//         cost: 10
//       });
  
//       const updatedRecipe = {
//         name: 'Updated Jollof Rice',
//         description: 'Updated description.',
//         nation: 'Nigeria',
//         region: 'West Africa',
//         ingredients: ['rice', 'tomato', 'onion'],
//         instructions: ['Cook rice', 'Prepare sauce', 'Mix with love'],
//         aliases: ['Jollof'],
//         categories: ['African'],
//         subcategories: ['Rice Dishes'],
//         images: [{ url: 'updated-image-url' }],
//         time: 50,
//         cost: 12
//       };
  
//       const res = await request.put(`/recipes/${recipe.id}`).send(updatedRecipe);
  
//       expect(res.status).toBe(200);
//       expect(res.body.name).toBe('Updated Jollof Rice');
//     });
  
//     it('should return 404 if recipe to update does not exist', async () => {
//       const res = await request.put('/recipes/999999').send({
//         name: 'Updated Jollof Rice',
//         description: 'Updated description.',
//         nation: 'Nigeria',
//         region: 'West Africa',
//         ingredients: ['rice', 'tomato', 'onion'],
//         instructions: ['Cook rice', 'Prepare sauce', 'Mix with love'],
//         aliases: ['Jollof'],
//         categories: ['African'],
//         subcategories: ['Rice Dishes'],
//         images: [{ url: 'updated-image-url' }],
//         time: 50,
//         cost: 12
//       });
  
//       expect(res.status).toBe(404);
//       expect(res.body.message).toBe('Recipe with id: 999999 not found');
//     });
//   });
  
  
//   describe('DELETE /recipes/:id', () => {
//     it('should delete a recipe by ID', async () => {
//       const recipe = await Recipe.create({
//         name: 'Jollof Rice',
//         description: 'Delicious African rice dish.',
//         nation: 'Nigeria',
//         region: 'West Africa',
//         time: 45,
//         cost: 10
//       });
  
//       const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaWF0IjoxNzQyOTUwMDk5LCJleHAiOjE3NDI5NTM2OTl9.PYWA7HB7afArCb4NKmXhjMUAHThN9deC2t_TGC7i450'; // Example token
  
//       const res = await request
//         .delete(`/recipes/${recipe.id}`)
//         .set('Authorization', `Bearer ${token}`);  // Send token in the Authorization header
  
//       expect(res.status).toBe(200);
//       expect(res.body.message).toBe('Recipe deleted successfully');
//     });
  
//     it('should return 404 if recipe does not exist', async () => {
//       const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaWF0IjoxNzQyOTUwMDk5LCJleHAiOjE3NDI5NTM2OTl9.PYWA7HB7afArCb4NKmXhjMUAHThN9deC2t_TGC7i450'; // Example token
  
//       const res = await request
//         .delete('/recipes/999999')  // Non-existent recipe ID
//         .set('Authorization', `Bearer ${token}`);  // Send token in the Authorization header
  
//       expect(res.status).toBe(404);
//       expect(res.body.message).toBe('Recipe not found');
//     });
//   });
  
  