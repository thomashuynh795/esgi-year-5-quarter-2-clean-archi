import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { CheckInEntity } from '../../domain/check-in.entity';
import { ReservationRepository } from '../../domain/reservation.repository';
import { ParkingSpotId } from '../../domain/classes/parking-spot-id.class';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { IdGenerator } from '../../../shared/id/domain/id-generator';
import type { ReservationEventPort } from '../ports/reservation-event.port';

export class CheckInByQrUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly idGenerator: IdGenerator,
    private readonly reservationEvents: ReservationEventPort,
  ) {}

  public async execute(params: {
    userId: string;
    spotId: string;
    now: Date;
    source?: string;
  }): Promise<CheckInEntity> {
    const now = new Date(params.now);

    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    const slot: ReservationSlot =
      now.getHours() < 12 ? ReservationSlot.AM : ReservationSlot.PM;

    const reservation = await this.reservationRepository.findByUserSpotDateSlot(
      {
        userId: params.userId,
        spotId: ParkingSpotId.of(params.spotId),
        date,
        slot,
      },
    );

    if (!reservation) {
      throw new NotFoundException('No reservation found for this QR check-in.');
    }

    if (reservation.userId !== params.userId) {
      throw new BadRequestException(
        'You can only check-in your own reservation.',
      );
    }

    if (reservation.slot === ReservationSlot.AM) {
      const cutoff = new Date(now);
      cutoff.setHours(11, 0, 0, 0);
      if (now.getTime() >= cutoff.getTime()) {
        throw new BadRequestException(
          'AM reservations can only be checked-in before 11:00.',
        );
      }
    }

    reservation.markAsCheckedIn(now);
    await this.reservationRepository.save(reservation);

    await this.reservationEvents.append({
      reservationId: reservation.id,
      type: 'reservation.checked_in',
      actorId: params.userId,
      payload: {
        source: params.source ?? 'qr',
        checkedInAt: now.toISOString(),
      },
    });

    const checkIn = new CheckInEntity({
      id: this.idGenerator.generate(),
      reservationId: reservation.id,
      userId: params.userId,
      spotId: reservation.spotId,
      checkedInAt: now,
      source: params.source ?? 'qr',
    });

    return this.reservationRepository.saveCheckIn(checkIn);
  }
}
