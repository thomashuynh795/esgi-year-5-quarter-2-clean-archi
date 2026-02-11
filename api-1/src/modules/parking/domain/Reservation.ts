
import { ParkingSlot } from './ParkingSlot';
import { User } from '../../users/domain/User';

export enum ReservationStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    OCCUPIED = 'OCCUPIED'
}

export class Reservation {
    constructor(
        public readonly id: number,
        public readonly date: Date,
        public readonly status: ReservationStatus,
        public readonly userId: number,
        public readonly slotId: number,
        public readonly period: 'AM' | 'PM',
        public readonly createdAt: Date,
        public readonly user?: User,
        public readonly slot?: ParkingSlot,
    ) { }
}
