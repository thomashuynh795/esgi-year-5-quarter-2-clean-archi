import { ParkingSlot } from '../../domain/entities/ParkingSlot';
import { ParkingSlotRepository } from '../../domain/repositories/ParkingSlotRepository';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class GetAvailableSlots {
    constructor(
        private parkingSlotRepository: ParkingSlotRepository,
        private reservationRepository: ReservationRepository
    ) { }

    async execute(date: Date): Promise<(ParkingSlot & { isReserved: boolean })[]> {
        const allSlots = await this.parkingSlotRepository.findAll();
        const reservations = await this.reservationRepository.findByDate(date);

        const reservedSlotIds = new Set(reservations.map(r => r.slotId));

        return allSlots.map(slot => ({
            ...slot,
            isReserved: reservedSlotIds.has(slot.id)
        }));
    }
}
