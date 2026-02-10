import { ParkingSlot } from '../entities/ParkingSlot';

export interface ParkingSlotRepository {
    findAll(): Promise<ParkingSlot[]>;
    findById(id: number): Promise<ParkingSlot | null>;
}
