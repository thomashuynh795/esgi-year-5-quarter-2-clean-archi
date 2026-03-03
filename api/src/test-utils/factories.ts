import { ParkingSpot } from '../parking/domain/parking-spot.entity';
import { ParkingSpotId } from '../reservation/domain/classes/parking-spot-id.class';
import { Reservation } from '../reservation/domain/classes/reservation.class';
import { ReservationSlot } from '../reservation/domain/enums/reservation-slot.enum';
import { ReservationStatus } from '../reservation/domain/enums/reservation-status.enum';
import { UserRole } from '../user/domain/enums/user-role.enum';
import { VehicleType } from '../user/domain/enums/vehicle-type.enum';
import { User } from '../user/domain/user.entity';

export function makeParkingSpot(overrides: Partial<ParkingSpot> = {}): ParkingSpot {
  const explicitId =
    overrides.id instanceof ParkingSpotId ? overrides.id.value : undefined;
  const fallbackRow = explicitId?.charAt(0) ?? 'A';
  const fallbackNumber = explicitId ? Number(explicitId.slice(1)) : 1;
  const row = overrides.row ?? fallbackRow;
  const number = overrides.number ?? fallbackNumber;
  const rawId = explicitId ?? `${row}${String(number).padStart(2, '0')}`;

  return new ParkingSpot({
    id: ParkingSpotId.of(rawId),
    row,
    number,
    hasCharger: overrides.hasCharger ?? ['A', 'F'].includes(row),
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-03-01T00:00:00.000Z'),
  });
}

export function makeUser(overrides: Partial<User> = {}): User {
  return new User(
    overrides.id ?? 'user-1',
    overrides.email ?? 'user@example.com',
    overrides.roles ?? [UserRole.Employee],
    overrides.vehicleType ?? VehicleType.None,
    overrides.passwordHash,
    overrides.firstName,
    overrides.lastName,
    overrides.isActive ?? true,
  );
}

export function makeReservation(
  overrides: {
    id?: string;
    userId?: string;
    spotId?: string;
    date?: Date;
    slot?: ReservationSlot;
    needsCharging?: boolean;
    status?: ReservationStatus;
    createdAt?: Date;
    updatedAt?: Date;
    cancelledAt?: Date | null;
    releasedAt?: Date | null;
  } = {},
): Reservation {
  return Reservation.rehydrate({
    id: overrides.id ?? 'reservation-1',
    userId: overrides.userId ?? 'user-1',
    spotId: ParkingSpotId.of(overrides.spotId ?? 'A01'),
    date: overrides.date ?? new Date('2026-03-04T00:00:00.000Z'),
    slot: overrides.slot ?? ReservationSlot.AM,
    needsCharging: overrides.needsCharging ?? false,
    status: overrides.status ?? ReservationStatus.Booked,
    createdAt: overrides.createdAt ?? new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: overrides.updatedAt,
    cancelledAt: overrides.cancelledAt ?? null,
    releasedAt: overrides.releasedAt ?? null,
  });
}
