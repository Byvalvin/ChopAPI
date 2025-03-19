// // types/express.d.ts
// declare namespace Express {
//     export interface Request {
//       user?: any;  // Adjust 'any' type as needed (for example, `user?: { id: string }`)
//     }
//   }
  
import { User } from '../models/App/User'; // Adjust based on your token payload type
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: User; // Optional: if user is authenticated, it will be available
        }
    }
}
