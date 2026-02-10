import { Reservation } from '../../domain/entities/Reservation';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class GetUserReservations {
    constructor(private reservationRepository: ReservationRepository) { }

    async execute(userId: number): Promise<Reservation[]> {
        return this.reservationRepository.findByUser(userId);
    }
}
