import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RESERVATION_REPOSITORY } from '../../domain/reservation.repository';
import type { ReservationRepository } from '../../domain/reservation.repository';
import { RESERVATION_EVENT_PORT } from '../../application/ports/reservation-event.port';
import type { ReservationEventPort } from '../../application/ports/reservation-event.port';

@Injectable()
export class NoShowCron {
  private readonly logger = new Logger(NoShowCron.name);

  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(RESERVATION_EVENT_PORT)
    private readonly reservationEvents: ReservationEventPort,
  ) {}

  @Cron('0 11 * * 1-5')
  async releaseUnconfirmedReservations() {
    this.logger.log(
      'Running 11 AM cron to release unconfirmed AM/Full-day reservations.',
    );
    const reservations =
      await this.reservationRepository.findUnconfirmedBookings(new Date());

    let releasedCount = 0;
    for (const res of reservations) {
      if (res.slot === 'AM') {
        const now = new Date();
        res.markAsNoShow(now);
        await this.reservationRepository.save(res);
        await this.reservationEvents.append({
          reservationId: res.id,
          type: 'reservation.no_show',
          actorId: null,
          payload: { cutoff: '11:00', markedAt: now.toISOString() },
        });
        releasedCount++;
      }
    }

    this.logger.log(`Marked ${releasedCount} AM reservations as NO_SHOW.`);
  }
}
