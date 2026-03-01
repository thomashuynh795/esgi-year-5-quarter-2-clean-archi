import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  OUTBOX_PORT,
  type OutboxPort,
} from '../../application/ports/outbox.port';
import { QUEUE_PORT, type QueuePort } from '../../application/ports/queue.port';

@Injectable()
export class ReservationOutboxPublisher {
  private readonly logger = new Logger(ReservationOutboxPublisher.name);

  public constructor(
    @Inject(OUTBOX_PORT) private readonly outbox: OutboxPort,
    @Inject(QUEUE_PORT) private readonly queue: QueuePort,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  public async publishPending(): Promise<void> {
    const pending = await this.outbox.findPending({ limit: 50 });
    if (pending.length === 0) return;

    for (const event of pending) {
      try {
        await this.queue.publish(event.type, event.payload);
        await this.outbox.markProcessed(event.id, new Date());
      } catch (err) {
        this.logger.error(
          `Failed to publish outbox event ${event.id} (${event.type})`,
          err instanceof Error ? err.stack : undefined,
        );
        return;
      }
    }
  }
}
