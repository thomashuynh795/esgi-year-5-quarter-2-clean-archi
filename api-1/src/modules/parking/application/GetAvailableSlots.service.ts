
import { Injectable, Inject } from '@nestjs/common';
import { ParkingSlot } from '../domain/ParkingSlot';
import { ParkingSlotRepository, PARKING_SLOT_REPOSITORY } from '../domain/ParkingSlotRepository';
import { ReservationRepository, RESERVATION_REPOSITORY } from '../domain/ReservationRepository';

@Injectable()
export class GetAvailableSlotsService {
    constructor(
        @Inject(PARKING_SLOT_REPOSITORY) private parkingSlotRepository: ParkingSlotRepository,
        @Inject(RESERVATION_REPOSITORY) private reservationRepository: ReservationRepository,
    ) { }

    async execute(startDate: Date, period?: 'AM' | 'PM', duration: number = 1): Promise<(ParkingSlot & { isReserved: boolean })[]> {
        const allSlots = await this.parkingSlotRepository.findAll();

        const datesToCheck: Date[] = [];
        const currentDate = new Date(startDate);
        let workingDaysCount = 0;

        while (workingDaysCount < duration) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                datesToCheck.push(new Date(currentDate));
                workingDaysCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const reservations = await this.reservationRepository.findForDates(datesToCheck);

        const reservedSlotIds = new Set<number>();

        for (const res of reservations) {
            if (!period || res.period === period) {
                const isToday = new Date().toDateString() === new Date(res.date).toDateString();
                const currentHour = new Date().getHours();
                const cutoffTime = new Date();
                cutoffTime.setHours(11, 0, 0, 0);
                const createdBeforeCutoff = new Date(res.createdAt) < cutoffTime;

                const isExpired = isToday &&
                    res.status === 'CONFIRMED' &&
                    currentHour >= 11 &&
                    createdBeforeCutoff;

                if (!isExpired) {
                    reservedSlotIds.add(res.slotId);
                }
            }
        }

        return allSlots.map(slot => ({
            ...slot,
            isReserved: reservedSlotIds.has(slot.id),
        }));
    }
}
