
import { Injectable, Inject } from '@nestjs/common';
import { Reservation } from '../domain/Reservation';
import { ReservationRepository, RESERVATION_REPOSITORY } from '../domain/ReservationRepository';

@Injectable()
export class CancelReservationService {
    constructor(
        @Inject(RESERVATION_REPOSITORY) private reservationRepository: ReservationRepository,
    ) { }

    async execute(reservationId: number): Promise<Reservation> {
        return this.reservationRepository.updateStatus(reservationId, 'CANCELLED');
    }
}
