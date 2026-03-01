import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';

export class GetReservationHistoryQuery {
  public constructor(
    public readonly start: Date,
    public readonly end: Date,
    public readonly slot?: ReservationSlot,
  ) {}
}
