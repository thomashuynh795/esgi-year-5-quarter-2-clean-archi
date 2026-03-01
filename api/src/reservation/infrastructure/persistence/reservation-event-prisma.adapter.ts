import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import type {
  ReservationEventPayload,
  ReservationEventPort,
} from '../../application/ports/reservation-event.port';

@Injectable()
export class ReservationEventPrismaAdapter implements ReservationEventPort {
  public constructor(private readonly prisma: PrismaService) {}

  public async append(params: {
    reservationId: string;
    type: string;
    payload?: ReservationEventPayload;
    actorId: string;
    createdAt: Date;
  }): Promise<void> {
    await this.prisma.reservationEvent.create({
      data: {
        reservationId: params.reservationId,
        type: params.type,
        payload: params.payload ? JSON.stringify(params.payload) : '{}',
        actorId: params.actorId,
        createdAt: params.createdAt,
      },
    });
  }
}
