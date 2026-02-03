import { Message } from '../../domain/entities/Message';
import { MessageRepository } from '../../domain/repositories/MessageRepository';

export class SaveMessage {
    constructor(private messageRepository: MessageRepository) { }

    async execute(content: string): Promise<Message> {
        return this.messageRepository.save(content);
    }
}
