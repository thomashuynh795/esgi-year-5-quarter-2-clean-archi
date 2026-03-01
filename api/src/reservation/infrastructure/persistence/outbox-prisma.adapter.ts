import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import type {
  OutboxEvent,
  OutboxEventToCreate,
  OutboxPort,
} from '../../application/ports/outbox.port';

@Injectable()
export class OutboxPrismaAdapter implements OutboxPort {
  public constructor(private readonly prisma: PrismaService) {}

  public async add(event: OutboxEventToCreate): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        type: event.type,
        payload: event.payload as any,
      },
    });
  }

  public async findPending(params: { limit: number }): Promise<OutboxEvent[]> {
    const events = await this.prisma.outboxEvent.findMany({
      where: { processedAt: null },
      orderBy: { createdAt: 'asc' },
      take: params.limit,
    });

    return events.map((e) => ({
      id: e.id,
      type: e.type,
      payload: e.payload as unknown,
      createdAt: e.createdAt,
      processedAt: e.processedAt,
    }));
  }

  public async markProcessed(
    eventId: string,
    processedAt: Date,
  ): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: { processedAt },
    });
  }
}
