import { ParkingSpotId } from '../../reservation/domain/classes/parking-spot-id.class';
import { ParkingSpot } from './parking-spot.entity';

export const PARKING_SPOT_REPOSITORY = Symbol('PARKING_SPOT_REPOSITORY');

export interface ParkingSpotRepository {
  findAll(): Promise<ParkingSpot[]>;
  findById(parkingSpotId: ParkingSpotId): Promise<ParkingSpot | null>;
  findByRow(row: string): Promise<ParkingSpot[]>;
  findByChargerAvailability(hasCharger: boolean): Promise<ParkingSpot[]>;
}
