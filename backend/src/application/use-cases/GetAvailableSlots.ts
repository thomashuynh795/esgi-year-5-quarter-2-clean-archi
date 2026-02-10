import { ParkingSlot } from '../../domain/entities/ParkingSlot';
import { ParkingSlotRepository } from '../../domain/repositories/ParkingSlotRepository';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class GetAvailableSlots {
    constructor(
        private parkingSlotRepository: ParkingSlotRepository,
        private reservationRepository: ReservationRepository
    ) { }

    async execute(startDate: Date, period?: 'AM' | 'PM', duration: number = 1): Promise<(ParkingSlot & { isReserved: boolean })[]> {
        const allSlots = await this.parkingSlotRepository.findAll();

        // Calculate all dates in the duration (skipping weekends)
        const datesToCheck: Date[] = [];
        let currentDate = new Date(startDate);
        let workingDaysCount = 0;

        while (workingDaysCount < duration) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 is Sunday, 6 is Saturday
                datesToCheck.push(new Date(currentDate));
                workingDaysCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const reservations = await this.reservationRepository.findForDates(datesToCheck);

        const reservedSlotIds = new Set<number>();

        for (const res of reservations) {
            // A slot is reserved if it has a reservation on ANY of the dates
            // AND the period matches (or we are asking for full day/ignoring period?)
            // If the user requests 'AM', and there is an 'AM' reservation on Day 2 -> Day 2 AM is busy -> Sequence is broken -> Slot unavailable.
            if (!period || res.period === period) {
                // Rule: If reservation is CONFIRMED (not occupied), for TODAY, and time is >= 11h, it is considered free
                // BUT only if the reservation was created BEFORE the cutoff time (11h today).
                // If I book at 14h, I should be able to keep it.

                const isToday = new Date().toDateString() === new Date(res.date).toDateString();
                const currentHour = new Date().getHours();

                // Cutoff time: Today at 11:00 AM
                const cutoffTime = new Date();
                cutoffTime.setHours(11, 0, 0, 0);

                // Check if created before the cutoff
                // If created AFTER cutoff, we assume it's a late booking and valid for now.
                const createdBeforeCutoff = new Date(res.createdAt) < cutoffTime;

                // console.log(`[DEBUG] Slot ${res.slotId} Expire Check: Created=${res.createdAt}, Cutoff=${cutoffTime}, IsToday=${isToday}, CreatedBefore=${createdBeforeCutoff}`);

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
            isReserved: reservedSlotIds.has(slot.id)
        }));
    }
}
