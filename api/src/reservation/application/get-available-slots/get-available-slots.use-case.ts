import { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { ReservationRepository } from '../../domain/reservation.repository';

export class GetAvailableSlotsUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly parkingSpotRepository: ParkingSpotRepository,
  ) {}

  public async execute(
    dateString: string,
    slot: ReservationSlot,
    duration: number,
  ) {
    const startDate = new Date(dateString);
    const allSpots = await this.parkingSpotRepository.findAll();

    const datesToCheck: Date[] = [];
    const currentDate = new Date(startDate);
    while (datesToCheck.length < duration) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        datesToCheck.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const reservations =
      await this.reservationRepository.findReservationsByDatesAndSlot(
        datesToCheck,
        slot,
      );
    const reservedSpotIds = new Set(reservations.map((r) => r.spotId));

    return allSpots.filter((spot) => !reservedSpotIds.has(spot.id));
  }
}
