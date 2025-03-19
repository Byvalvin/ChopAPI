import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../models/App/User'; // Assuming you have your User model imported here
import { generateToken } from '../../utils'; // JWT helper functions

export const registerUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create the new user
        const newUser = await User.create({
            email,
            password: hashedPassword,
        });

        // Generate JWT token for the user
        const token = generateToken(newUser.id.toString());

        res.status(201).json({
            message: 'User registered successfully',
            token, // Send the JWT token to the user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }

        // Generate a JWT token for the user
        const token = generateToken(user.id.toString());

        // Send the token back to the client
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
    }
};