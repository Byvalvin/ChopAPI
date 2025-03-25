
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();  // This will load variables from the .env file


// Sanitize the search term to allow spaces and hyphens, remove unwanted characters
export const sanitizeString = (str: string)=>str.replace(/[^\w\s-]/gi, ''); // Allow spaces and hyphens

// Ensure that str is a valid string before calling trim(), or handle it as needed (throw error, log, etc.)
export const normalizeString = (str: string) => typeof str === 'string' ? sanitizeString(str.trim().toLowerCase()) : '';


// Utility function for pagination
const paginate = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Helper function to validate and parse the query parameters
export const validateQueryParams = (req: Request) :any => {
  const { category, subcategory, nation, region, time, cost, sort, limit = '10', page = '1', search} = req.query; // all possible queries being considered for api

  // Initialize the errors object
  const errors: string[] = [];

  // Validate category (should be a string if provided)
  if (category && typeof category !== 'string') {
    errors.push('Category must be a string');
  }

  // Validate subcategory (should be a string if provided)
  if (subcategory && typeof subcategory !== 'string') {
    errors.push('Subcategory must be a string');
  }

  // Validate nation (should be a string if provided)
  if (nation && typeof nation !== 'string') {
    errors.push('Nation must be a string');
  }

  // Validate region (should be a string if provided)
  if (region && typeof region !== 'string') {
    errors.push('Region must be a string');
  }

  // Validate time (should be a valid integer and greater than 0 if provided)
  if (time && (isNaN(Number(time)) || Number(time) <= 0)) {
    errors.push('Time must be a positive number');
  }

  // Validate cost (should be a valid number and greater than or equal to 0 if provided)
  if (cost && (isNaN(Number(cost)) || Number(cost) < 0)) {
    errors.push('Cost must be a non-negative number');
  }

  // Validate limit (should be a valid positive integer)
  const parsedLimit = parseInt(limit as string, 10);
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    errors.push('Limit must be a positive integer');
  }

  // Validate page (should be a valid positive integer)
  const parsedPage = parseInt(page as string, 10);
  if (isNaN(parsedPage) || parsedPage <= 0) {
    errors.push('Page must be a positive integer');
  }

  // Validate search (should be a string if provided)
  if (search && typeof search !== 'string') {
    errors.push('Search term must be a string');
  }

  // Return errors if any
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // Return parsed and sanitized query parameters if valid
  return {
    isValid: true,
    queryParams: {
      category: category ? normalizeString(category as string) : undefined,
      subcategory: subcategory ? normalizeString(subcategory as string) : undefined,
      nation: nation ? normalizeString(nation as string) : undefined,
      region: region ? normalizeString(region as string) : undefined,
      time: time ? parseInt(time as string, 10) : undefined,
      cost: cost ? parseFloat(cost as string) : undefined,
      sort: sort ? normalizeString(sort as string) : undefined,
      limit: parsedLimit,
      page: parsedPage,
      search: search ? normalizeString(search as string) : undefined,
    },
  };
};


// Generate a new JWT token
const secret = process.env.JWT_SECRET;
const expiresIn = "1h";
export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, secret as string, {
        expiresIn: expiresIn, // e.g., 1h
    });
};

// Verify the JWT token
export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
};
