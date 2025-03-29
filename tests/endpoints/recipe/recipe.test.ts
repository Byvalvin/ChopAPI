import supertest from 'supertest';
import app, { server } from '../../../src/server';  // Import the app and server
import sequelize from '../../../src/DB/connection';  // Import your sequelize instance
import Recipe from '../../../src/models/Recipe';  // Import Recipe model

const request = supertest(app);  // Create a supertest instance for making API calls

const baseURL = '/chop/api';
const test_subcategory = 'testing';
const TO = 11000; // Timeout in milliseconds

let authToken: string = ''; // Store the authentication token
let createdRecipeIds: number[] = []; // Store the IDs of the created recipes

const nonExistentId = 999999; 


// TEST ADDING NEW RECIPES
describe(`POST ${baseURL}/recipes`, () => {
  it('should add two recipes successfully', async () => {
    const testRecipes : any = [
      {
        name: 'Jollof Rice',
        description: 'Delicious African rice dish.',
        nation: 'Nigeria',
        region: 'West Africa',
        ingredients: [
          { name: 'rice', quantity: 2, unit: "cups" },
          { name: 'tomato', quantity: 3, unit: "whole" },
          { name: 'pepper', quantity: 2, unit: "whole" }
        ],
        instructions: ['Cook rice', 'Prepare sauce', 'Mix'],
        aliases: ['Jollof'],
        categories: ['African'],
        subcategories: [test_subcategory, 'Rice Dishes'],
        images: [{ url: 'image-url' }],
        time: 45,
        cost: 10
      },
  
      {
        name: 'Fried Plantain',
        description: 'Tasty fried plantain.',
        nation: 'Nigeria',
        region: 'West Africa',
        ingredients: [
          { name: 'plantain', quantity: 8, unit: "whole" },
          { name: 'oil', quantity: 1, unit: "cup" },
          { name: 'salt', quantity: 0.5, unit: "tsp" }
        ],
        instructions: ['Peel plantain', 'Fry in oil', 'Serve'],
        aliases: ['Dodo'],
        categories: ['African'],
        subcategories: [test_subcategory, 'Side Dishes'],
        images: [{ url: 'image-url' }],
        time: 30,
        cost: 5
      }
    ];
    
    // add test recipes
    for(const testRecipe of testRecipes){
       // Send POST requests to add the recipes
      const res = await request.post(`${baseURL}/recipes`).send(testRecipe);
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Recipe added with ID');
      
      // Extract the recipe ID from the response message using regex
      const match = res.body.message.match(/Recipe added with ID: (\d+)/);
      if (match) createdRecipeIds.push(parseInt(match[1], 10));  // Push the ID into the array
    }

  }, TO);

  it('should return 400 if required fields are missing', async () => {
    const incompleteRecipe = { // no instructions
      name: 'Jollof Rice',
      description: 'Delicious African rice dish.',
      nation: 'Nigeria',
      region: 'West Africa',
      ingredients: [
        { name: 'rice', quantity: 2, unit: "cups" },
        { name: 'tomato', quantity: 3, unit: "whole" }
      ],
      time: 45,
    };

    const res = await request.post(`${baseURL}/recipes`).send(incompleteRecipe);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });
});




// TEST GETTING ALL recipes with optional query
describe(`GET ${baseURL}/recipes`, () => {
  it('should return all recipes filtered by subcategory', async () => {
    // Send a GET request to fetch recipes filtered by subcategory
    const res = await request.get(`${baseURL}/recipes?subcategory=${test_subcategory}`);
    expect(res.status).toBe(200);

    // Ensure the returned recipes match the ones we created
    res.body.results.forEach((recipe: Recipe) => {
      expect(createdRecipeIds).toContain(recipe.id);
    });
  });

  it('should return 404 if no recipes found for a subcategory', async () => {
    // Send a GET request with a non-existent subcategory
    const nonExistentSubcategory = 'NonExistentSubcategory';
    const res = await request.get(`${baseURL}/recipes?subcategory=${nonExistentSubcategory}`);
    
    expect(res.status).toBe(200);
    expect(res.body.totalResults).toBe(0);
  });
});




// TEST GETTTING Recipe by ID test
describe(`GET ${baseURL}/recipes/:id`, () => {
  it('should return a specific recipe by ID', async () => {
    const recipeId = createdRecipeIds[0];  // Use the first created recipe ID
    const res = await request.get(`${baseURL}/recipes/${recipeId}`);
    
    expect(res.status).toBe(200);

    // Ensure the recipe data matches what we expect
    const recipe = res.body;

    // Verify the basic fields of the recipe
    expect(recipe.id).toBe(recipeId);
    expect(recipe.name).toBe('Jollof Rice');
    expect(recipe.description).toBe('Delicious African rice dish.');
    // expect(recipe.nation).toBe('Nigeria'); // for these, can use the nations endpoint to get all nations then use search to filter it(search="Nigeria")
    // expect(recipe.region).toBe('West Africa');
    expect(recipe.time).toBe(45);
    expect(recipe.cost).toBe(10);
  });

  it('should return 404 if the recipe ID does not exist', async () => {
    const res = await request.get(`${baseURL}/recipes/${nonExistentId}`);
    
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`Recipe with id: ${nonExistentId} not found`);
  });
});




// TEST PUT(RECPLACING) Recipe by ID test (Replace Recipe)
describe(`PUT ${baseURL}/recipes/:id`, () => {
  it('should replace a specific recipe by ID', async () => {
    const recipeId = createdRecipeIds[0];  // Use the first created recipe ID

    // Create a new recipe object to replace the existing one
    const updatedRecipe = {
      name: 'Updated Jollof Rice',
      description: 'A new and improved Jollof Rice recipe with extra spice.',
      nation: 'Nigeria',
      region: 'West Africa',
      ingredients: [
        { name: 'rice', quantity: 2, unit: "cups" },
        { name: 'tomato', quantity: 4, unit: "whole" },
        { name: 'pepper', quantity: 3, unit: "whole" }
      ],
      instructions: ['Cook rice with spices', 'Prepare sauce with tomatoes', 'Mix and serve'],
      aliases: ['Jollof Rice Extra Spicy'],
      categories: ['African', 'Spicy Dishes'],
      subcategories: [test_subcategory, 'Rice Dishes'],
      images: [{ url: 'new-image-url' }],
      time: 50,
      cost: 15
    };

    const res = await request.put(`${baseURL}/recipes/${recipeId}`).send(updatedRecipe);
    
    expect(res.status).toBe(200);

    // Ensure the updated recipe is correctly returned
    const updatedRecipeData = res.body;
    
    expect(updatedRecipeData.id).toBe(recipeId);
    expect(updatedRecipeData.name).toBe(updatedRecipe.name);
    expect(updatedRecipeData.description).toBe(updatedRecipe.description);
    // expect(updatedRecipeData.nation).toBe(updatedRecipe.nation); // same deal as get by id
    // expect(updatedRecipeData.region).toBe(updatedRecipe.region);
    expect(updatedRecipeData.time).toBe(updatedRecipe.time);
    expect(updatedRecipeData.cost).toBe(updatedRecipe.cost);
  });

  it('should return 404 if the recipe ID does not exist', async () => {
    const res = await request.put(`${baseURL}/recipes/${nonExistentId}`).send({
      name: 'Non-existent Recipe',
      description: 'This should fail',
      nation: 'Unknown',
      region: 'Unknown',
      ingredients: [
        { name: 'sugar', quantity: 1, unit: "cups" },
        { name: 'spice', quantity: 1, unit: "cups" },
        { name: 'everythin nice', quantity: 1, unit: "cups" }
      ],
      instructions: ['Cook rice with spices', 'Prepare sauce with tomatoes', 'Mix and serve'],
      aliases: ['Jollof Rice Extra Spicy'],
      categories: [],
      subcategories: [],
      images: [],
      time: 1,
      cost: 0
    });
    
    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`Recipe with id: ${nonExistentId} not found`);
  });
});




// TEST DELETING RECIPES, TEST AUTHENTICATION TO DELETE RECIPES
describe(`DELETE ${baseURL}/recipes/:id`, () => {
  it('should delete the recipes that were created during the tests', async () => {
    // Step 1: Authenticate the user
    const userCredentials = {
      email: 'tester@gmail.com',
      password: 'testerpassword'
    };

    // Helper function to register or login the user and get the token
    const authenticateUser = async () => {
      // Try logging in first
      let loginRes = await request.post(`${baseURL}/auth/login`).send(userCredentials);

      if (loginRes.status === 400 || loginRes.body.message === 'Invalid email or password') {
        // If login fails (user doesn't exist), create a new user
        let registerRes = await request.put(`${baseURL}/auth`).send(userCredentials);
        expect(registerRes.status).toBe(201);
        loginRes = await request.post(`${baseURL}/auth/login`).send(userCredentials);
      }

      // If login is successful, get the token
      expect(loginRes.status).toBe(200);
      authToken = loginRes.body.token;
    };
    await authenticateUser();

    // Step 2: Delete each recipe using the IDs stored in createdRecipeIds
    for (const recipeId of createdRecipeIds) {
      const deleteRes = await request
        .delete(`${baseURL}/recipes/${recipeId}`)
        .set('Authorization', `Bearer ${authToken}`);  // Pass the token as a Bearer token

      // Step 3: Verify that the recipe was deleted successfully
      expect(deleteRes.status).toBe(204);
      //expect(deleteRes.body.message).toBe('Recipe deleted successfully');

      // Step 4: Verify that the recipe no longer exists by trying to fetch it
      const fetchRes = await request.get(`${baseURL}/recipes/${recipeId}`);
      expect(fetchRes.status).toBe(404);
      expect(fetchRes.body.message).toBe(`Recipe with id: ${recipeId} not found`);
    }
  }, TO);
});



// Close the server after all tests are finished
afterAll(async () => {
  server.close(); // Gracefully close the server
  await sequelize.close(); // Close the Sequelize connection if it's still open
});