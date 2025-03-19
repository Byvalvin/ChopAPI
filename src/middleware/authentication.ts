import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils';
import { User } from '../models/App/User';

// Middleware to check for a valid JWT token in the Authorization header
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from header

    if (!token) {
        res.status(401).json({ message: 'Authorization token required' });
        return;
    }

    try {
        const decoded = verifyToken(token); // Verify the token
        // Explicitly type req.user to avoid TypeScript errors
        (req as Request & { user: User }).user = decoded; // Attach the decoded token info to the request object
        next(); // Proceed to the next middleware/route handler
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
