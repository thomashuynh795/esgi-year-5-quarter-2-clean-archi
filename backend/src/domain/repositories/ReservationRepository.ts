import { Reservation } from '../entities/Reservation';

export interface ReservationRepository {
    create(userId: number, slotId: number, date: Date, period?: 'AM' | 'PM'): Promise<Reservation>;
    findByUser(userId: number): Promise<Reservation[]>;
    findByDate(date: Date): Promise<Reservation[]>;
    findByDateAndSlot(date: Date, slotId: number, period?: 'AM' | 'PM'): Promise<Reservation | null>;
    countUserReservationsForWeek(userId: number, date: Date): Promise<number>;
    updateStatus(id: number, status: string): Promise<Reservation>;
    findForDates(dates: Date[]): Promise<Reservation[]>;
    findById(id: number): Promise<Reservation | null>;
    delete(id: number): Promise<void>;
}
