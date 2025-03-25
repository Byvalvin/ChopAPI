import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { normalizeString, validateQueryParams } from '../utils';
import Category from '../models/Category';
import CategoryCache from '../caching/CategoryCaching';


// Controller function for getting all ingredients
export const getAllCategories = async(req: Request, res: Response) => {
    // Step 1: get user input
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
        res.status(400).json({ errors: errors });
        return;
    }
    let { sort = 'name', limit = 10, page = 1, search = '' } = queryParams;

    // Parse limit and page to integers
    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Handle sort parameter
    let order: any = [];
    if (sort) {
        order = [['name', 'ASC']]; // Default sorting by region name
    }


    // Step 3: Fulfil Request
    try { // Sequelize findAll query with dynamic conditions and sorting
        let whereConditions: any = {};  // Initialize where conditions
        // If there's a search query, filter regions by name
        if (search) {
            whereConditions.name = { [Op.iLike]: `%${search}%` };  // Match regions by name (case-insensitive)
        }
        const rows = await Category.findAll({ // Fetching categories based on dynamic conditions
            where: whereConditions,
            limit,
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
        for(const row of rows){ // setCache
            await CategoryCache.setCache(row.id, row);
        }

        // Step 4: Return paginated results
        res.status(200).json({
            totalResults: rows.length,
            results: rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching categories from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};
