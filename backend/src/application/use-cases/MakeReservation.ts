import { Reservation } from '../../domain/entities/Reservation';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';
import { ParkingSlotRepository } from '../../domain/repositories/ParkingSlotRepository';
import { SlotType } from '../../domain/entities/ParkingSlot';

export class MakeReservation {
    constructor(
        private reservationRepository: ReservationRepository,
        private parkingSlotRepository: ParkingSlotRepository
    ) { }

    async execute(userId: number, slotId: number, startDate: Date, period: 'AM' | 'PM', duration: number = 1, needsCharging: boolean = false): Promise<Reservation[]> {
        // Validate duration
        if (duration < 1 || duration > 5) {
            throw new Error('Duration must be between 1 and 5 days');
        }

        const datesToReserve: Date[] = [];
        let currentDate = new Date(startDate);
        let workingDaysCount = 0;

        // Calculate working days
        while (workingDaysCount < duration) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 is Sunday, 6 is Saturday
                datesToReserve.push(new Date(currentDate));
                workingDaysCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 1. Check if slot exists
        const slot = await this.parkingSlotRepository.findById(slotId);
        if (!slot) {
            throw new Error('Parking slot not found');
        }

        // Rule: Electric slots (A/F) reserved logic
        if (slot.type === SlotType.ELECTRIC && !needsCharging) {
            throw new Error('Electric slots are reserved for vehicles needing charging');
        }
        if (needsCharging && slot.type !== SlotType.ELECTRIC) {
            throw new Error('If you need charging, you must select an electric slot');
        }

        // 2. Limit check (Global)
        const currentFutureReservations = await this.reservationRepository.countUserReservationsForWeek(userId, new Date());
        if (currentFutureReservations + duration > 5) {
            throw new Error(`You cannot exceed 5 active reservations. You currently have ${currentFutureReservations}.`);
        }

        // 3. Validation for ALL dates
        for (const date of datesToReserve) {
            const existingReservation = await this.reservationRepository.findByDateAndSlot(date, slotId, period);
            if (existingReservation) {
                // Check if we can overwrite it (No-Show Rule)
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
                    // Cancel the old one to free up the slot
                    // We need to await this to ensure consistency
                    await this.reservationRepository.delete(existingReservation.id);
                } else {
                    throw new Error(`Slot already reserved for ${date.toISOString().split('T')[0]} ${period}`);
                }
            }
        }

        // 4. Create reservations
        const createdReservations: Reservation[] = [];
        for (const date of datesToReserve) {
            const reservation = await this.reservationRepository.create(userId, slotId, date, period);
            createdReservations.push(reservation);
        }

        return createdReservations;
    }
}
