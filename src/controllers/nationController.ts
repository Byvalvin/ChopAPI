import { Request, Response } from 'express';

import Nation from "../models/Nation";
import { validateQueryParams } from '../utils';
import { Op } from 'sequelize';
import NationCache from '../caching/NationCaching';

// Main endpoint to get all recipes
export const getAllNations = async (req: Request, res: Response) => {
    // Step 1: get user input
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
      res.status(400).json({ errors: errors });
      return;
    }
    let { sort, limit = 10, page = 1, search } = queryParams; 
    
    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Handle sort parameter
    let order: any = [];
    if (sort) {
        // If sort is not a valid string, you can choose to either:
        // - Ignore sorting (i.e., pass an empty array)
        // - Use a default sort, for example by name (you can change this to your default)
        order = [['name', 'ASC']];
    }

    // Step 3: Fulfil Request
    try { // Sequelize findAll query with dynamic conditions and sorting
        let whereConditions: any = {};  // Initialize where conditions
        // If there's a search query, filter nations by name
        if (search) {
            whereConditions.name = { [Op.iLike]: `%${search}%` };  // Match nations by name (case-insensitive)
        }
        const rows = await Nation.findAll({ // Fetching nations based on dynamic conditions
            where:whereConditions,
            limit: Number(limit),
            offset: (page - 1) * limit,
            order,  // Pass the order here
        });

        // If no results are found
        if (!rows.length) {
            res.status(200).json({
                totalResults: 0,
                results: [],
            });
            return;
        }
        for(const row of rows){ //setCache
            await NationCache.setCache(row.id, row);
        }

        // Step 4: Return paginated results
        res.status(200).json({
            totalResults: rows.length,
            results: rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching nations from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};


// Get one nation
export const getNationById = async(req: Request, res: Response) =>{
    const { nation_id } = req.params; // Step 1: get user input. Extract the recipe ID from the request parameters

    const nationId = parseInt(nation_id, 10);  // Step 2: validate and parse user input, return if bad input. Convert ID to an integer
    if (isNaN(nationId)) {  
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }

    // Step 3: Fulfil Request
    try {
        // Use getRecipeDetails to fetch the nation details by ID
        const nation = await Nation.findOne({
            where: { id: nationId},
        });

        if (!nation) {
            res.status(404).json({ message: `Nation with id: ${nationId} not found` });
            return;
        }

        // Step 4: Return the recipe details with status 200
        res.status(200).json(nation);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching nation details', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};