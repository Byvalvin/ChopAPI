import supertest from 'supertest';
import app,{server} from '../../../src/server'; // Import the app instead of a live API URL
import sequelize from '../../../src/DB/connection';  // Import your sequelize instance

const request = supertest(app);  // Create a supertest instance for making API calls

const baseURL = '/chop/api';
const test_subcategory = 'testing';
const TO = 11000; // in millisecs


describe(`POST ${baseURL}/recipes`, () => {
  it('should add two recipes successfully', async () => {
    const newRecipe1 = {
      name: 'Jollof Rice',
      description: 'Delicious African rice dish.',
      nation: 'Nigeria',
      region: 'West Africa',
      ingredients: [
        {name:'rice', quantity:2, unit:"cups"},
        {name:'tomato', quantity:3, unit:"whole"},
        {name:'pepper', quantity:2, unit:"whole"}
      ],
      instructions: ['Cook rice', 'Prepare sauce', 'Mix'],
      aliases: ['Jollof'],
      categories: ['African'],
      subcategories: [test_subcategory, 'Rice Dishes'],
      images: [{ url: 'image-url' }],
      time: 45,
      cost: 10
    };

    const newRecipe2 = {
      name: 'Fried Plantain',
      description: 'Tasty fried plantain.',
      nation: 'Nigeria',
      region: 'West Africa',
      ingredients: [
        {name:'plantain', quantity:8, unit:"whole"},
        {name:'oil', quantity:1, unit:"cup"},
        {name:'salt', quantity:0.5, unit:"tsp"}
      ],
      instructions: ['Peel plantain', 'Fry in oil', 'Serve'],
      aliases: ['Dodo'],
      categories: ['African'],
      subcategories: [test_subcategory, 'Side Dishes'],
      images: [{ url: 'image-url' }],
      time: 30,
      cost: 5
    };

    // Send POST requests to add the recipes
    console.log('Sending first recipe...');
    const res1 = await request.post(`${baseURL}/recipes`).send(newRecipe1);
    console.log('First recipe response received', res1.body);
    expect(res1.status).toBe(201);
    expect(res1.body.message).toContain('Recipe added with ID');
    
    console.log('Sending second recipe...');
    const res2 = await request.post(`${baseURL}/recipes`).send(newRecipe2);
    console.log('Second recipe response received', res2.body);
    expect(res2.status).toBe(201);
    expect(res2.body.message).toContain('Recipe added with ID');
  }, TO);

  it('should return 400 if required fields are missing', async () => {
    const incompleteRecipe = { // no instructions
      name: 'Jollof Rice',
      description: 'Delicious African rice dish.',
      nation: 'Nigeria',
      region: 'West Africa',
      ingredients: [
        {name:'rice', quantity:2, unit:"cups"},
        {name:'tomato', quantity:3, unit:"whole"}
      ],
      time: 45,
    };

    const res = await request.post(`${baseURL}/recipes`).send(incompleteRecipe);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Missing required fields');
  });
});

// Close the server after all tests are finished
afterAll(async () => {
    await server.close(); // Gracefully close the server
    await sequelize.close(); // Close the Sequelize connection if it's still open
  });

  /*
  https://jestjs.io/docs/api#testname-fn-timeout
  https://stackoverflow.com/questions/68811529/how-can-i-increase-the-test-time-out-value-in-jest
  */