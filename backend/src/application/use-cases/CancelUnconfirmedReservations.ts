import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class CancelUnconfirmedReservations {
    constructor(private reservationRepository: ReservationRepository) { }

    async execute(date: Date): Promise<void> {
        // 1. Get all CONFIRMED reservations for the date
        const reservations = await this.reservationRepository.findByDate(date);

        // 2. Filter for those that are still CONFIRMED (findByDate already filters out CANCELLED, but we want only CONFIRMED, not OCCUPIED)
        const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED');

        // 3. Cancel them
        for (const reservation of confirmedReservations) {
            await this.reservationRepository.updateStatus(reservation.id, 'CANCELLED');
            console.log(`Cancelled reservation ${reservation.id} due to no check-in`);
        }
    }
}
