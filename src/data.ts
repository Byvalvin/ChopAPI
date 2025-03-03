import { Recipe } from './interface';

// Sample test data (ideally, you'd mock this data or use a real test database)
// Assuming the imports for the interfaces are done

export const recipes: Recipe[] = [
  {
    id: 1, // Adding an id for the recipe
    name: 'Spaghetti Carbonara',
    description: 'A classic Roman pasta dish.',
    nation: 'Italy',
    region: 'Rome',
    time: 30,
    cost: 15,
    instructions: [
      'Boil the spaghetti according to the package instructions.',
      'Fry the pancetta in a pan until crispy.',
      'Mix the eggs with cheese and season with salt and pepper.',
      'Combine the cooked spaghetti with the pancetta and egg mixture.',
      'Serve with additional cheese and pepper on top.'
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
      { id: 1, name: 'Spaghetti', quantity: 200, unit: 'grams' },
      { id: 2, name: 'Eggs', quantity: 4, unit: 'pieces' },
      { id: 3, name: 'Pancetta', quantity: 100, unit: 'grams' }
    ]
  },
  {
    id: 2, // Adding an id for the recipe
    name: 'Tacos',
    description: 'Traditional Mexican street food.',
    nation: 'Mexico',
    region: 'Tijuana',
    time: 20,
    cost: 5,
    instructions: [
      'Warm the tortillas in a pan or microwave.',
      'Cook the beef in a pan until browned.',
      'Fill tortillas with beef, and top with cheese.',
      'Serve with your favorite salsa and garnishes.'
    ],
    categories: [{ id: 2, name: 'Mexican' }],
    subcategories: [{ id: 2, name: 'Street Food' }],
    aliases: ["Beef Tacos"],
    images: [
      {
        id: 2,
        url: "https://example.com/image4.jpg",
        type: "thumbnail",
        caption: "Taco Image 1"
      },
    ],
    ingredients: [
      { id: 4, name: 'Tortilla', quantity: 2, unit: 'pieces' },
      { id: 5, name: 'Beef', quantity: 150, unit: 'grams' },
      { id: 6, name: 'Cheese', quantity: 50, unit: 'grams' }
    ]
  },
  // Add more sample recipes as needed, ensuring each recipe follows the Recipe interface
];

// Extract unique ingredients used in recipes
export const ingredients = [
  { id: 1, name: "Spaghetti" },
  { id: 2, name: "Eggs" },
  { id: 3, name: "Pancetta" },
  { id: 4, name: "Tortilla" },
  { id: 5, name: "Beef" },
  { id: 6, name: "Cheese" }
];

// Extract unique categories used in recipes
export const categories = [
  { id: 1, name: "Italian" },
  { id: 2, name: "Mexican" }
];

// Extract unique categories used in recipes
export const subcategories = [
  { id: 1, name: "Pasta" },
  { id: 2, name: "Street Food" }
];

export const images = [
    {
      id: 1,
      url: "https://example.com/image3.jpg",
      type: "thumbnail",
      caption: "Spag Image 1"
    },
    {
      id: 2,
      url: "https://example.com/image4.jpg",
      type: "thumbnail",
      caption: "Taco Image 1"
    },
];

// Extract unique regions mentioned in recipes
export const regions = [
  { id: 1, name: "Rome", nations:["Italy"] },
  { id: 2, name: "Tijuana", nations:["Mexico"] }
];
