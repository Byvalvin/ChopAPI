import { Request, Response } from 'express';

import Nation from "../models/Nation";
import { validateQueryParams } from '../utils';

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

        const rows = await Nation.findAll({ // Fetching nations based on dynamic conditions
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