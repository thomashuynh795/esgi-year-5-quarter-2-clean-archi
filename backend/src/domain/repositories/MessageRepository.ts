import { Message } from '../entities/Message';

export interface MessageRepository {
    save(content: string): Promise<Message>;
}
