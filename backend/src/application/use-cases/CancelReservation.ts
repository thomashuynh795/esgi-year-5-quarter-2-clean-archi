import { Reservation } from '../../domain/entities/Reservation';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class CancelReservation {
    constructor(
        private reservationRepository: ReservationRepository
    ) { }

    async execute(reservationId: number): Promise<Reservation> {
        return this.reservationRepository.updateStatus(reservationId, 'CANCELLED');
    }
}
