import { Reservation } from '../entities/Reservation';

export interface ReservationRepository {
    create(userId: number, slotId: number, date: Date): Promise<Reservation>;
    findByUser(userId: number): Promise<Reservation[]>;
    findByDate(date: Date): Promise<Reservation[]>;
    findByDateAndSlot(date: Date, slotId: number): Promise<Reservation | null>;
    countUserReservationsForWeek(userId: number, date: Date): Promise<number>;
    updateStatus(id: number, status: string): Promise<Reservation>;
}
