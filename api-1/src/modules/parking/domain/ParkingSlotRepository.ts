
import { ParkingSlot } from './ParkingSlot';

export const PARKING_SLOT_REPOSITORY = 'PARKING_SLOT_REPOSITORY';

export interface ParkingSlotRepository {
    findAll(): Promise<ParkingSlot[]>;
    findById(id: number): Promise<ParkingSlot | null>;
    save(slot: ParkingSlot): Promise<ParkingSlot>;
}
