
import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Reservation, ReservationStatus } from '../domain/Reservation';
import { ReservationRepository, RESERVATION_REPOSITORY } from '../domain/ReservationRepository';

@Injectable()
export class CheckInService {
    constructor(
        @Inject(RESERVATION_REPOSITORY) private reservationRepository: ReservationRepository,
    ) { }

    async execute(reservationId: number): Promise<Reservation> {
        const reservation = await this.reservationRepository.findById(reservationId);
        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        if (reservation.status === ReservationStatus.OCCUPIED) {
            return reservation;
        }

        if (reservation.status !== ReservationStatus.CONFIRMED) {
            throw new BadRequestException(`Cannot check in. Reservation status is ${reservation.status}`);
        }

        const today = new Date().toISOString().split('T')[0];
        const resDate = new Date(reservation.date).toISOString().split('T')[0];

        if (today !== resDate) {
            throw new BadRequestException('You can only check in on the day of the reservation');
        }

        const currentHour = new Date().getHours();
        if (currentHour >= 11) {
            throw new BadRequestException('Check-in time expired. Reservations are released after 11:00 AM.');
        }

        return this.reservationRepository.updateStatus(reservationId, ReservationStatus.OCCUPIED);
    }
}
