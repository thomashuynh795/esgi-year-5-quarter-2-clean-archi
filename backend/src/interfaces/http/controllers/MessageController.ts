import { Request, Response } from 'express';
import { SaveMessage } from '../../../application/use-cases/SaveMessage';
import { PrismaMessageRepository } from '../../../infrastructure/repositories/PrismaMessageRepository';

export class MessageController {
    async save(req: Request, res: Response) {
        const { content } = req.body;

        const repository = new PrismaMessageRepository();
        const useCase = new SaveMessage(repository);

        try {
            const message = await useCase.execute(content || 'Hello World');
            res.json(message);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
