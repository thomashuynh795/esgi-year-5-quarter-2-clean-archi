import { Injectable, Logger } from '@nestjs/common';
import type { QueuePort } from '../../application/ports/queue.port';

@Injectable()
export class RabbitMQQueueAdapter implements QueuePort {
  private readonly logger = new Logger(RabbitMQQueueAdapter.name);

  public async publish(topic: string, payload: unknown): Promise<void> {
    this.logger.log(`Publishing to RabbitMQ topic: ${topic}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);
  }
}
