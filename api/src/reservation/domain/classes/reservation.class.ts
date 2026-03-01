import type { ReservationSlot } from '../enums/reservation-slot.enum';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { ParkingSpotId } from './parking-spot-id.class';

export class Reservation {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly spotId: ParkingSpotId,
    public readonly date: Date,
    public readonly slot: ReservationSlot,
    public readonly needsCharging: boolean,
    public status: ReservationStatus,
    public readonly createdAt: Date,
    public updatedAt?: Date,
    public cancelledAt?: Date | null,
    public releasedAt?: Date | null,
  ) {}

  public get needsCharger(): boolean {
    return this.needsCharging;
  }

  public static book(params: {
    id: string;
    userId: string;
    spotId: ParkingSpotId;
    date: Date;
    slot: ReservationSlot;
    needsCharging: boolean;
    now: Date;
  }): Reservation {
    const dateMidnight = new Date(params.date);
    dateMidnight.setHours(0, 0, 0, 0);

    return new Reservation(
      params.id,
      params.userId,
      params.spotId,
      dateMidnight,
      params.slot,
      params.needsCharging,
      ReservationStatus.Booked,
      params.now,
      undefined,
      null,
      null,
    );
  }

  public static rehydrate(props: {
    id: string;
    userId: string;
    spotId: ParkingSpotId;
    date: Date;
    slot: ReservationSlot;
    needsCharging: boolean;
    status: ReservationStatus;
    createdAt: Date;
    updatedAt?: Date;
    cancelledAt?: Date | null;
    releasedAt?: Date | null;
  }): Reservation {
    const dateMidnight = new Date(props.date);
    dateMidnight.setHours(0, 0, 0, 0);

    return new Reservation(
      props.id,
      props.userId,
      props.spotId,
      dateMidnight,
      props.slot,
      props.needsCharging,
      props.status,
      props.createdAt,
      props.updatedAt,
      props.cancelledAt ?? null,
      props.releasedAt ?? null,
    );
  }

  public isUpcoming(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resDate = new Date(this.date);
    resDate.setHours(0, 0, 0, 0);

    const activeStatuses: ReservationStatus[] = [
      ReservationStatus.Booked,
      ReservationStatus.CheckedIn,
    ];

    return today <= resDate && activeStatuses.includes(this.status);
  }

  public markAsCheckedIn(now: Date): void {
    if (this.status !== ReservationStatus.Booked) {
      throw new BadRequestException('Can only check in a booked reservation.');
    }

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const resDate = new Date(this.date);
    resDate.setHours(0, 0, 0, 0);

    if (today.getTime() !== resDate.getTime()) {
      throw new BadRequestException(
        'Can only check in on the date of the reservation.',
      );
    }

    this.status = ReservationStatus.CheckedIn;
    this.updatedAt = new Date(now);
  }

  public cancel(now: Date): void {
    if (this.status !== ReservationStatus.Booked) {
      throw new BadRequestException(
        'Can only cancel a reservation that is still booked.',
      );
    }

    this.status = ReservationStatus.Cancelled;
    this.cancelledAt = new Date(now);
    this.updatedAt = new Date(now);
  }

  public release(now: Date): void {
    if (this.status !== ReservationStatus.Booked) {
      throw new BadRequestException(
        'Can only release a booked reservation that was not checked in.',
      );
    }

    this.status = ReservationStatus.Released;
    this.releasedAt = new Date(now);
    this.updatedAt = new Date(now);
  }

  public markAsNoShow(now: Date): void {
    if (this.status !== ReservationStatus.Booked) {
      throw new BadRequestException(
        'Can only mark as NO_SHOW a booked reservation.',
      );
    }

    this.status = ReservationStatus.NoShow;
    this.updatedAt = new Date(now);
  }
}
