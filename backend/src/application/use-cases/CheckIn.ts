import { Reservation, ReservationStatus } from '../../domain/entities/Reservation';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class CheckIn {
    constructor(private reservationRepository: ReservationRepository) { }

    async execute(reservationId: number): Promise<Reservation> {
        const reservation = await this.reservationRepository.findById(reservationId);
        if (!reservation) {
            throw new Error('Reservation not found');
        }

        if (reservation.status === ReservationStatus.OCCUPIED) {
            return reservation; // Already checked in
        }

        if (reservation.status !== ReservationStatus.CONFIRMED) {
            throw new Error(`Cannot check in. Reservation status is ${reservation.status}`);
        }

        // Check if date matches Today
        const today = new Date().toISOString().split('T')[0];
        const resDate = new Date(reservation.date).toISOString().split('T')[0];

        if (today !== resDate) {
            throw new Error('You can only check in on the day of the reservation');
        }

        const currentHour = new Date().getHours();
        if (currentHour >= 11) {
            throw new Error('Check-in time expired. Reservations are released after 11:00 AM.');
        }

        return this.reservationRepository.updateStatus(reservationId, ReservationStatus.OCCUPIED);
    }
}

