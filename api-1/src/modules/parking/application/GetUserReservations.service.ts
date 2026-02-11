
import { Injectable, Inject } from '@nestjs/common';
import { Reservation } from '../domain/Reservation';
import { ReservationRepository, RESERVATION_REPOSITORY } from '../domain/ReservationRepository';

@Injectable()
export class GetUserReservationsService {
    constructor(
        @Inject(RESERVATION_REPOSITORY) private reservationRepository: ReservationRepository,
    ) { }

    async execute(userId: number): Promise<Reservation[]> {
        return this.reservationRepository.findByUser(userId);
    }
}
