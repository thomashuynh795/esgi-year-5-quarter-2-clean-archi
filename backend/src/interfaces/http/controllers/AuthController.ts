import { Request, Response } from 'express';
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';

export class AuthController {
    private userRepository: PrismaUserRepository;

    constructor() {
        this.userRepository = new PrismaUserRepository();
    }

    async login(req: Request, res: Response) {
        const { email } = req.body;

        try {
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            // Simple mock login, just returning user info
            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const users = await this.userRepository.findAll();
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
