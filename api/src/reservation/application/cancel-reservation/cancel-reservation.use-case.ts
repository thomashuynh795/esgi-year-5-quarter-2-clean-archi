import { ForbiddenException } from '../../../shared/error/domain/forbidden.exception';
import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { UserRole } from '../../../user/domain/enums/user-role.enum';
import { UserRepository } from '../../../user/domain/user.repository';
import { Reservation } from '../../domain/classes/reservation.class';
import { ReservationRepository } from '../../domain/reservation.repository';
import type { ReservationEventPort } from '../ports/reservation-event.port';

export class CancelReservationUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly userRepository: UserRepository,
    private readonly reservationEvents: ReservationEventPort,
  ) {}

  public async execute(
    userId: string,
    reservationId: string,
  ): Promise<Reservation> {
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
      throw new ForbiddenException('You can only cancel your own reservation.');
    }

    const now = new Date();
    if (this.isReservationInPast(reservation.date, reservation.slot, now)) {
      throw new BadRequestException(
        'Cannot cancel a reservation that is already in the past.',
      );
    }

    const previousStatus = reservation.status;
    reservation.cancel(now);

    await this.reservationEvents.append({
      reservationId: reservation.id,
      type: 'reservation.cancelled',
      actorId: userId,
      payload: {
        previousStatus,
      },
    });
    return this.reservationRepository.save(reservation);
  }

  private isReservationInPast(date: Date, slot: string, now: Date): boolean {
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (reservationDate.getTime() < today.getTime()) {
      return true;
    }

    if (reservationDate.getTime() > today.getTime()) {
      return false;
    }

    if (slot === 'AM') {
      const amCutoff = new Date(today);
      amCutoff.setHours(12, 0, 0, 0);
      return now.getTime() >= amCutoff.getTime();
    }

    const pmCutoff = new Date(today);
    pmCutoff.setHours(18, 0, 0, 0);
    return now.getTime() >= pmCutoff.getTime();
  }
}
