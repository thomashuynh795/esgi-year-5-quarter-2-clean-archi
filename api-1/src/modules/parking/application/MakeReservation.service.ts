
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Reservation } from '../domain/Reservation';
import { ReservationRepository, RESERVATION_REPOSITORY } from '../domain/ReservationRepository';
import { ParkingSlotRepository, PARKING_SLOT_REPOSITORY } from '../domain/ParkingSlotRepository';
import { SlotType } from '../domain/ParkingSlot';

@Injectable()
export class MakeReservationService {
    constructor(
        @Inject(RESERVATION_REPOSITORY) private reservationRepository: ReservationRepository,
        @Inject(PARKING_SLOT_REPOSITORY) private parkingSlotRepository: ParkingSlotRepository,
    ) { }

    async execute(userId: number, slotId: number, startDate: Date, period: 'AM' | 'PM', duration: number = 1, needsCharging: boolean = false): Promise<Reservation[]> {
        if (duration < 1 || duration > 5) {
            throw new BadRequestException('Duration must be between 1 and 5 days');
        }

        const datesToReserve: Date[] = [];
        const currentDate = new Date(startDate);
        let workingDaysCount = 0;

        while (workingDaysCount < duration) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                datesToReserve.push(new Date(currentDate));
                workingDaysCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const slot = await this.parkingSlotRepository.findById(slotId);
        if (!slot) {
            throw new BadRequestException('Parking slot not found');
        }

        if (slot.type === SlotType.ELECTRIC && !needsCharging) {
            throw new BadRequestException('Electric slots are reserved for vehicles needing charging');
        }
        if (needsCharging && slot.type !== SlotType.ELECTRIC) {
            throw new BadRequestException('If you need charging, you must select an electric slot');
        }

        const currentFutureReservations = await this.reservationRepository.countUserReservationsForWeek(userId, new Date());
        if (currentFutureReservations + duration > 5) {
            throw new BadRequestException(`You cannot exceed 5 active reservations. You currently have ${currentFutureReservations}.`);
        }

        for (const date of datesToReserve) {
            const existingReservation = await this.reservationRepository.findByDateAndSlot(date, slotId, period);
            if (existingReservation) {
                const isToday = new Date().toDateString() === new Date(existingReservation.date).toDateString();
                const currentHour = new Date().getHours();

                const cutoffTime = new Date();
                cutoffTime.setHours(11, 0, 0, 0);
                const createdBeforeCutoff = new Date(existingReservation.createdAt) < cutoffTime;

                const isExpired = isToday &&
                    existingReservation.status === 'CONFIRMED' &&
                    currentHour >= 11 &&
                    createdBeforeCutoff;

                if (isExpired) {
                    await this.reservationRepository.delete(existingReservation.id);
                } else {
                    throw new BadRequestException(`Slot already reserved for ${date.toISOString().split('T')[0]} ${period}`);
                }
            }
        }

        const createdReservations: Reservation[] = [];
        for (const date of datesToReserve) {
            const reservation = await this.reservationRepository.create(userId, slotId, date, period);
            createdReservations.push(reservation);
        }

        return createdReservations;
    }
}
