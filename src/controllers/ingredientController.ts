import { Request, Response } from 'express';
import { Ingredient } from '../interface';  // Assuming the interface exists

// Dummy data for ingredients
let ingredientDB: Ingredient[] = [
    { id: 1, name: 'Tomato' },
    { id: 2, name: 'Garlic' },
    { id: 3, name: 'Onion' },
    { id: 4, name: 'Olive Oil' },
    { id: 5, name: 'Basil' },
    { id: 6, name: 'Salt' },
];

// Utility function for pagination
const paginate = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Controller function for getting all ingredients
export const getAllIngredients = (req: Request, res: Response) => {
    try {
        const { sort = 'name', limit = 10, page = 1, search = '' } = req.query;

        // Parse limit and page to integers
        const parsedLimit = parseInt(limit as string, 10);
        const parsedPage = parseInt(page as string, 10);

        const { offset } = paginate(parsedPage, parsedLimit);

        // Apply search filter
        let filteredIngredients: Ingredient[] = ingredientDB;

        if (search) {
            filteredIngredients = ingredientDB.filter(ingredient =>
                ingredient.name.toLowerCase().includes((search as string).toLowerCase())
            );
        }

        // Apply sorting
        if (sort === 'name') {
            filteredIngredients.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Apply pagination
        const paginatedIngredients = filteredIngredients.slice(offset, offset + parsedLimit);

        // Get the total count of ingredients for pagination
        const totalCount = filteredIngredients.length;

        // Respond with paginated and filtered ingredients
        res.status(200).json({
            ingredients: paginatedIngredients,
            pagination: {
                page: parsedPage,
                limit: parsedLimit,
                totalCount,
                totalPages: Math.ceil(totalCount / parsedLimit),
            },
        });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ message: 'Error fetching ingredients' });
    }
};
