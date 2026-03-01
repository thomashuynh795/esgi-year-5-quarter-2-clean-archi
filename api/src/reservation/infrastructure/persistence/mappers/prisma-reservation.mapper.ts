import type {
  Reservation as PrismaReservation,
  CheckIn as PrismaCheckIn,
} from '@prisma/client';
import type { ReservationSlot } from '../../../domain/enums/reservation-slot.enum';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { CheckInEntity } from '../../../domain/check-in.entity';
import { Reservation } from '../../../domain/classes/reservation.class';
import { ParkingSpotId } from '../../../domain/classes/parking-spot-id.class';

export class PrismaReservationMapper {
  static toDomain(prismaReservation: PrismaReservation): Reservation {
    return Reservation.rehydrate({
      id: prismaReservation.id,
      userId: prismaReservation.userId,
      spotId: ParkingSpotId.of(prismaReservation.spotId),
      date: prismaReservation.date,
      slot: prismaReservation.slot as ReservationSlot,
      needsCharging: prismaReservation.needsCharger,
      status: prismaReservation.status as ReservationStatus,
      createdAt: prismaReservation.createdAt,
      updatedAt: prismaReservation.updatedAt,
      cancelledAt: prismaReservation.cancelledAt,
      releasedAt: prismaReservation.releasedAt,
    });
  }

  static toPrismaCreate(
    reservation: Reservation,
  ): Omit<PrismaReservation, 'createdAt' | 'updatedAt'> {
    return {
      id: reservation.id,
      userId: reservation.userId,
      spotId: reservation.spotId.value,
      date: reservation.date,
      slot: reservation.slot,
      status: reservation.status,
      needsCharger: reservation.needsCharging,
      cancelledAt: reservation.cancelledAt ?? null,
      releasedAt: reservation.releasedAt ?? null,
    };
  }

  static checkInToDomain(prismaCheckIn: PrismaCheckIn): CheckInEntity {
    return new CheckInEntity({
      id: prismaCheckIn.id,
      reservationId: prismaCheckIn.reservationId,
      userId: prismaCheckIn.userId,
      spotId: ParkingSpotId.of(prismaCheckIn.spotId),
      checkedInAt: prismaCheckIn.checkedInAt,
      source: prismaCheckIn.source,
    });
  }
}
