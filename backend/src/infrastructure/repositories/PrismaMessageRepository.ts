import { PrismaClient } from '@prisma/client';
import { Message } from '../../domain/entities/Message';
import { MessageRepository } from '../../domain/repositories/MessageRepository';

import prisma from '../database/prisma';

export class PrismaMessageRepository implements MessageRepository {
    private prisma: PrismaClient = prisma;

    constructor() {
    }

    async save(content: string): Promise<Message> {
        const savedMessage = await this.prisma.message.create({
            data: {
                content,
            },
        });
        return new Message(savedMessage.id, savedMessage.content);
    }
}
