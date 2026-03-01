import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { UserRole } from '../../../user/domain/enums/user-role.enum';
import { UserRepository } from '../../../user/domain/user.repository';
import { CheckInEntity } from '../../domain/check-in.entity';
import { ReservationRepository } from '../../domain/reservation.repository';
import { IdGenerator } from '../../../shared/id/domain/id-generator';
import type { ReservationEventPort } from '../ports/reservation-event.port';

export class CheckInUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly userRepository: UserRepository,
    private readonly idGenerator: IdGenerator,
    private readonly reservationEvents: ReservationEventPort,
  ) {}

  public async execute(
    userId: string,
    reservationId: string,
  ): Promise<CheckInEntity> {
    const reservation =
      await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException('Reservation not found.');
    }

    if (
      reservation.userId !== userId &&
      !(await this.userRepository.findById(userId))?.roles.includes(
        UserRole.Secretary,
      )
    ) {
      throw new BadRequestException(
        'You can only check-in your own reservation.',
      );
    }

    const now = new Date();

    if (reservation.slot === 'AM') {
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
      actorId: userId,
      payload: { source: 'web', checkedInAt: now.toISOString() },
    });

    const checkIn = new CheckInEntity({
      id: this.idGenerator.generate(),
      reservationId: reservation.id,
      userId,
      spotId: reservation.spotId,
      checkedInAt: now,
      source: 'web',
    });

    return this.reservationRepository.saveCheckIn(checkIn);
  }
}
