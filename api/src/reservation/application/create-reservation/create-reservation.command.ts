import { ParkingSpotId } from '../../domain/classes/parking-spot-id.class';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';

export class CreateReservationCommand {
  constructor(
    public readonly userId: string,
    public readonly spotId: ParkingSpotId,
    public readonly startDate: Date,
    public readonly slot: ReservationSlot,
    public readonly duration: number,
    public readonly needsCharging: boolean,
  ) {}
}
