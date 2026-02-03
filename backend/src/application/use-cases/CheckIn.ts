import { Reservation } from '../../domain/entities/Reservation';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class CheckIn {
    constructor(private reservationRepository: ReservationRepository) { }

    async execute(reservationId: number): Promise<Reservation> {
        // We could add validation here (e.g. check if it's the right day)
        // But for simplicity, we just update.
        return this.reservationRepository.updateStatus(reservationId, 'OCCUPIED');
    }
}
