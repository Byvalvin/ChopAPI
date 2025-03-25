import rateLimit from 'express-rate-limit';
import { User } from '../models/App/User';
import { Request } from 'express';

// Apply rate limit middleware
export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later."
});

export const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: (req) => {
        // Custom logic for setting the rate limit based on the user's status
        if ((req as Request & { user: User }).user) {
        return 200; // Authenticated users can make more requests
        }
        return 100; // Unauthenticated users are limited to fewer requests
    },
    message: "Too many requests, please try again later."
});
  

