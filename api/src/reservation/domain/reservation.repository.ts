import { CheckInEntity } from './check-in.entity';
import { ParkingSpotId } from './classes/parking-spot-id.class';
import { Reservation } from './classes/reservation.class';
import { ReservationSlot } from './enums/reservation-slot.enum';
import type { ReservationStatus } from './enums/reservation-status.enum';

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');

export interface ReservationRepository {
  save(reservation: Reservation): Promise<Reservation>;

  findById(id: string): Promise<Reservation | null>;

  findByUser(userId: string): Promise<Reservation[]>;

  findBySpot(spotId: ParkingSpotId, date: Date): Promise<Reservation[]>;

  findConflicting(
    userId: string,
    date: Date,
    slot: ReservationSlot,
  ): Promise<Reservation | null>;

  findConflictingSpot(
    spotId: ParkingSpotId,
    date: Date,
    slot: ReservationSlot,
  ): Promise<Reservation | null>;

  saveCheckIn(checkIn: CheckInEntity): Promise<CheckInEntity>;

  findUnconfirmedBookings(
    date: Date,
    slot?: ReservationSlot,
  ): Promise<Reservation[]>;

  findReservationsByDatesAndSlot(
    dates: Date[],
    slot: ReservationSlot,
  ): Promise<Reservation[]>;

  findByDate(date: Date): Promise<Reservation[]>;

  findByDateRange(params: {
    start: Date;
    end: Date;
    statuses?: ReservationStatus[];
  }): Promise<Reservation[]>;

  countDistinctActiveDatesFrom(params: {
    userId: string;
    from: Date;
    statuses?: ReservationStatus[];
  }): Promise<number>;

  findByUserSpotDateSlot(params: {
    userId: string;
    spotId: ParkingSpotId;
    date: Date;
    slot: ReservationSlot;
  }): Promise<Reservation | null>;

  findReservationsForMonth(year: number, month: number): Promise<Reservation[]>;

  existsConflict(params: {
    spotId: ParkingSpotId;
    date: Date;
    slot: ReservationSlot;
  }): Promise<boolean>;
}
