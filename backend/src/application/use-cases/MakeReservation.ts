import { Reservation } from '../../domain/entities/Reservation';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';
import { ParkingSlotRepository } from '../../domain/repositories/ParkingSlotRepository';
import { SlotType } from '../../domain/entities/ParkingSlot';

export class MakeReservation {
    constructor(
        private reservationRepository: ReservationRepository,
        private parkingSlotRepository: ParkingSlotRepository
    ) { }

    async execute(userId: number, slotId: number, date: Date, needsCharging: boolean = false): Promise<Reservation> {
        // 1. Check if slot exists
        const slot = await this.parkingSlotRepository.findById(slotId);
        if (!slot) {
            throw new Error('Parking slot not found');
        }

        // Rule: Electric slots (A/F) reserved logic
        // If slot is ELECTRIC and user does NOT need charging -> Prevent or Allow?
        // Requirement says: "If someone needs to charge, they must ask for a place in rows A or F"
        // Does not explicitly forbid non-electric cars from parking there, but usually we reserve them.
        // Let's implement: Electric slots are exclusive for electric usage.
        if (slot.type === SlotType.ELECTRIC && !needsCharging) {
            throw new Error('Electric slots are reserved for vehicles needing charging');
        }

        // If needs charging, user MUST match with an electric slot (this logic is usually handled by frontend filtering, but good to enforce)
        if (needsCharging && slot.type !== SlotType.ELECTRIC) {
            // This is technically allowed (electric car in standard spot), but maybe inefficient? 
            // Let's keep it simple: Charging cars CAN park in standard, but they won't charge.
            // Warning: The requirement says "must ask for a place in rows A or F".
            // Let's assume strict validation:
            throw new Error('If you need charging, you must select an electric slot');
        }


        // 2. Check if slot is already reserved
        const existingReservation = await this.reservationRepository.findByDateAndSlot(date, slotId);
        if (existingReservation) {
            throw new Error('Slot already reserved for this date');
        }

        // 3. Check 5 days limit
        // We count all reservations for the user around the requested date (e.g. same week or just global check)
        // Requirement: "maximum of 5 working days". 
        // Simplification: We check the count of CONFIRMED reservations for the user.
        // Since we don't have a full Week Logic implementation yet, let's just check TOTAL future reservations? 
        // Or simpler: Check reservations within the +- 7 days window of the target date to simulate a "week-ish" constraint.
        const reservationsCount = await this.reservationRepository.countUserReservationsForWeek(userId, date);
        if (reservationsCount >= 5) {
            throw new Error('You cannot reserve more than 5 days per week');
        }

        return this.reservationRepository.create(userId, slotId, date);
    }
}
