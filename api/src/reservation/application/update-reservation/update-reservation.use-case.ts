import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { UserRole } from '../../../user/domain/enums/user-role.enum';
import { UserRepository } from '../../../user/domain/user.repository';
import { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import { Reservation } from '../../domain/classes/reservation.class';
import { ParkingSpotId } from '../../domain/classes/parking-spot-id.class';
import { ReservationRepository } from '../../domain/reservation.repository';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import type { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import type { ReservationEventPort } from '../ports/reservation-event.port';

export class UpdateReservationUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly userRepository: UserRepository,
    private readonly reservationEvents: ReservationEventPort,
  ) {}

  public async execute(params: {
    actorId: string;
    reservationId: string;
    spotId?: string;
    date?: Date;
    slot?: ReservationSlot;
    needsCharging?: boolean;
  }): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(
      params.reservationId,
    );

    if (!reservation) {
      throw new NotFoundException('Reservation not found.');
    }

    const actor = await this.userRepository.findById(params.actorId);
    if (!actor) {
      throw new NotFoundException('Actor not found.');
    }

    const isSecretaryOrManager = actor.roles.some(
      (r) => r === UserRole.Secretary || r === UserRole.Manager,
    );

    if (!isSecretaryOrManager) {
      throw new BadRequestException(
        'Only managers/secretaries can edit reservations.',
      );
    }

    if (reservation.status !== ReservationStatus.Booked) {
      throw new BadRequestException(
        'Only BOOKED reservations can be edited (not CHECKED_IN/CANCELLED/NO_SHOW/RELEASED).',
      );
    }

    const newSpotId = params.spotId
      ? ParkingSpotId.of(params.spotId)
      : reservation.spotId;
    const newDate = params.date ?? reservation.date;
    const newSlot = params.slot ?? reservation.slot;
    const newNeedsCharging = params.needsCharging ?? reservation.needsCharger;

    const normalizedDate = new Date(newDate);
    normalizedDate.setHours(0, 0, 0, 0);
    const day = normalizedDate.getDay();
    const isWeekend = day === 0 || day === 6;
    if (isWeekend) {
      throw new BadRequestException(
        'Reservations are not allowed on Saturday or Sunday.',
      );
    }

    const spot = await this.parkingSpotRepository.findById(newSpotId);
    if (!spot) {
      throw new BadRequestException('Parking spot not found.');
    }
    if (newNeedsCharging && !spot.hasCharger) {
      throw new BadRequestException(
        'Charging requested but spot has no charger.',
      );
    }

    const conflict = await this.reservationRepository.existsConflict({
      spotId: newSpotId,
      date: normalizedDate,
      slot: newSlot,
    });

    if (conflict) {
      const existing = await this.reservationRepository.findConflictingSpot(
        newSpotId,
        newDate,
        newSlot,
      );
      if (existing && existing.id !== reservation.id) {
        throw new BadRequestException('Spot already reserved for this slot.');
      }
    }

    const before = {
      spotId: reservation.spotId.value,
      date: reservation.date.toISOString(),
      slot: reservation.slot,
      needsCharging: reservation.needsCharger,
    };

    const updated = Reservation.rehydrate({
      id: reservation.id,
      userId: reservation.userId,
      spotId: newSpotId,
      date: normalizedDate,
      slot: newSlot,
      needsCharging: newNeedsCharging,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: new Date(),
      cancelledAt: reservation.cancelledAt,
      releasedAt: reservation.releasedAt,
    });

    const saved = await this.reservationRepository.save(updated);

    await this.reservationEvents.append({
      reservationId: saved.id,
      type: 'reservation.updated',
      actorId: params.actorId,
      payload: {
        before,
        after: {
          spotId: saved.spotId.value,
          date: saved.date.toISOString(),
          slot: saved.slot,
          needsCharging: saved.needsCharger,
        },
      },
    });

    return saved;
  }
}
