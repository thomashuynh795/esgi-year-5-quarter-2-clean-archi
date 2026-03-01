import { ParkingSpotId } from './classes/parking-spot-id.class';

export class CheckInEntity {
  id!: string;
  reservationId!: string;
  userId!: string;
  spotId!: ParkingSpotId;
  checkedInAt!: Date;
  source?: string | null;

  constructor(partial: Partial<CheckInEntity>) {
    Object.assign(this, partial);
  }
}
