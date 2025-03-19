import { NextFunction, Request, Response } from "express";

import { normalizeString, validateQueryParams } from "../utils";
import { generateRegionFilterConditions, getRegionDetails, stdInclude } from "./controllerHelpers/regionControllerHelpers";
import Region from "../models/Region";
import { Op } from "sequelize";

// Main endpoint to get all recipes
export const getAllRegions = async (req: Request, res: Response) => {
    // Step 1: get user input
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
      res.status(400).json({ errors: errors });
      return;
    }
    let { nation, sort, limit = 10, page = 1, search } = queryParams; 
    
    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Handle sort parameter
    let order: any = [];
    if (sort) {
        order = [[sort, 'ASC']];
    } else {
        order = [['name', 'ASC']]; // Default sorting by region name
    }

    // Step 3: Fulfil Request
    try { // Sequelize findAll query with dynamic conditions and sorting
        const { whereConditions, includeConditions } = generateRegionFilterConditions(queryParams); // Generate the where and include conditions using the helper function

        const rows = await Region.findAll({ // Fetching recipe IDs based on dynamic conditions
            where: whereConditions, // Apply where conditions
            include: includeConditions, // Apply include conditions (associations)
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

        // Now use `getRecipeDetails` to fetch details for each recipe
        const detailedRegions = [];
        // Loop through each recipe to fetch detailed data
        for (const recipe of rows) {
            const detailedRegion = await getRegionDetails(recipe.id);  // Get full details using the existing function
            if (detailedRegion) { detailedRegions.push(detailedRegion); }
        }

        // Step 4: Return paginated results with detailed recipes
        res.status(200).json({
            totalResults: detailedRegions.length,
            results: detailedRegions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching regions from the database', error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};



// Get Region by ID
export const getRegionById = async (req: Request, res: Response, next: NextFunction) => {
    const { region_id } = req.params; // Step 1: get user input. Extract the recipe ID from the request parameters

    if (isNaN(Number(region_id))) {  // Check if the ID is a valid number (ID should be numeric)
        return next();  // If it's not a number, pass to the next route handler
    }

    const regionId = parseInt(region_id, 10);  // Step 2: validate and parse user input, return if bad input. Convert ID to an integer
    if (isNaN(regionId)) {  
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }

    // Step 3: Fulfil Request
    try {
        // Use getRecipeDetails to fetch the region details by ID
        const region = await getRegionDetails(regionId);
        if (!region) {
            res.status(404).json({ message: `Region with id: ${regionId} not found` });
            return;
        }

        // Step 4: Return the recipe details with status 200
        res.status(200).json(region);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching region details', error:`${(error as Error).name}: ${(error as Error).message}` });
        return;
    }
};


// Get Region with a given name
export const getRegionByRegionName = async (req: Request, res: Response) => {
    const { region_name } = req.params; // Step 1: get user input. Extract the name from the request params
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
        res.status(400).json({ errors: errors });
        return;
    }
    let { sort, limit = 10, page = 1} = queryParams; 
            
    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Apply sorting
    let order: any = [];
    if (sort) {
        order = [[sort, 'ASC']];
    } else {
        // Default sorting by name if no sort is provided
        order = [['name', 'ASC']];
    }
    const normalizedSearchTerm = normalizeString(region_name); // Normalize the name parameter from the request

    // Step 3: Fulfil Request
    try {
        const { whereConditions, includeConditions } = generateRegionFilterConditions(queryParams); // Generate the where conditions using the helper function (filters based on category, subcategory, etc.)
        whereConditions.name = { [Op.iLike]: `%${normalizedSearchTerm}%` }; // Apply name filter to the whereConditions, Match the region name

        const region  = await Region.findOne({ // Sequelize query to fetch the filtered and sorted regions with the required associations
            where: whereConditions, // Apply where conditions for filtering
            include: includeConditions.length ? includeConditions : stdInclude, // Apply include conditions for associations
            limit,
            offset: (page - 1) * limit,
            order: order, // Apply ordering
        });
        if (!region) {
            res.status(404).json({ message: `Region with name: ${region_name} not found` });
            return;
        }
        

        // Step 4: Return the result
        res.status(200).json(await getRegionDetails(region.id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching region with name ${region_name} from the database`, error:`${(error as Error).name}: ${(error as Error).message}` });
    }
};


export const getRegionNationsByRegionId = async(req:Request, res:Response, next:NextFunction)=>{
    const { region_id } = req.params; // Step 1: get user input. Extract the recipe ID from the request parameters

    if (isNaN(Number(region_id))) {  // Check if the ID is a valid number (ID should be numeric)
        return next();  // If it's not a number, pass to the next route handler
    }

    const regionId = parseInt(region_id, 10);  // Step 2: validate and parse user input, return if bad input. Convert ID to an integer
    if (isNaN(regionId)) {  
        res.status(400).json({ message: "Invalid ID format" });
        return;
    }
    
    // Step 3: Fulfil Request
    try {
        // Use getRecipeDetails to fetch the region details by ID
        const region = await getRegionDetails(regionId);
        if (!region) {
            res.status(404).json({ message: `Region with id: ${regionId} not found` });
            return;
        }

        // Step 4: Return the recipe details with status 200
        res.status(200).json({
            id:regionId,
            nations:region.nations
        });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching region nations with id ${region_id} from the database`, error:`${(error as Error).name}: ${(error as Error).message}` });
        return;
    }

}

export const getRegionNationsByRegionName = async(req:Request, res:Response)=>{
    const { region_name } = req.params; // Step 1: get user input. Extract the name from the request params
    const {isValid, queryParams, errors} = validateQueryParams(req);

    // Step 2: validate and parse user input, return if bad input
    if (!isValid) { // If validation failed, return the errors
        res.status(400).json({ errors: errors });
        return;
    }
    let { sort, limit = 10, page = 1} = queryParams; 
            
    // Validate limit and page to ensure they are numbers and within reasonable bounds
    limit = Math.max(1, Math.min(Number(limit), 100));  // Max 100 recipes per page
    page = Math.max(1, Number(page));

    // Apply sorting
    let order: any = [];
    if (sort) {
        order = [[sort, 'ASC']];
    } else {
        // Default sorting by name if no sort is provided
        order = [['name', 'ASC']];
    }
    const normalizedSearchTerm = normalizeString(region_name); // Normalize the name parameter from the request

    // Step 3: Fulfil Request
    try {
        const { whereConditions, includeConditions } = generateRegionFilterConditions(queryParams); // Generate the where conditions using the helper function (filters based on category, subcategory, etc.)
        whereConditions.name = { [Op.iLike]: `%${normalizedSearchTerm}%` }; // Apply name filter to the whereConditions, Match the region name

        const region  = await Region.findOne({ // Sequelize query to fetch the filtered and sorted regions with the required associations
            where: whereConditions, // Apply where conditions for filtering
            include: includeConditions.length ? includeConditions : stdInclude, // Apply include conditions for associations
            limit,
            offset: (page - 1) * limit,
            order: order, // Apply ordering
        });
        const detailedRegion = region ? await getRegionDetails(region.id) : null;
        if (!region || !detailedRegion) {
            res.status(404).json({ message: `Region with name: ${region_name} not found` });
            return;
        }

        // Step 4: Return the result
        res.status(200).json({
            name:region_name,
            nations:detailedRegion.nations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Error fetching region nations with name ${region_name} from the database`, error:`${(error as Error).name}: ${(error as Error).message}` });
    }

}

