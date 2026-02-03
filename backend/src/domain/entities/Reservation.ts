import { ParkingSlot } from './ParkingSlot';
import { User } from './User';

export enum ReservationStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED'
}

export class Reservation {
    constructor(
        public readonly id: number,
        public readonly date: Date,
        public readonly status: ReservationStatus,
        public readonly userId: number,
        public readonly slotId: number,
        public readonly user?: User,
        public readonly slot?: ParkingSlot
    ) { }
}
