import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import { ReservationRepository } from '../../domain/reservation.repository';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import type { GetDailyOccupancyResult } from './get-daily-occupancy.result';

export class GetDailyOccupancyUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly parkingSpotRepository: ParkingSpotRepository,
  ) {}

  public async execute(date: Date): Promise<GetDailyOccupancyResult> {
    const targetDate = this.toMidnight(date);

    if (Number.isNaN(targetDate.getTime())) {
      throw new BadRequestException('date is invalid.');
    }

    const [spots, reservations] = await Promise.all([
      this.parkingSpotRepository.findAll(),
      this.reservationRepository.findByDateRange({
        start: targetDate,
        end: targetDate,
        statuses: [
          ReservationStatus.Booked,
          ReservationStatus.CheckedIn,
          ReservationStatus.Released,
        ],
      }),
    ]);

    const reservedBySlot = {
      [ReservationSlot.AM]: new Set<string>(),
      [ReservationSlot.PM]: new Set<string>(),
    };

    for (const reservation of reservations) {
      reservedBySlot[reservation.slot].add(reservation.spotId.value);
    }

    return {
      date: this.toYmd(targetDate),
      spots: spots
        .map((spot) => ({
          spotId: spot.id.value,
          row: spot.row,
          number: spot.number,
          hasCharger: spot.hasCharger,
          isActive: spot.isActive,
          isAvailableAM:
            spot.isActive &&
            !reservedBySlot[ReservationSlot.AM].has(spot.id.value),
          isAvailablePM:
            spot.isActive &&
            !reservedBySlot[ReservationSlot.PM].has(spot.id.value),
        }))
        .sort(
          (left, right) =>
            left.row.localeCompare(right.row) || left.number - right.number,
        ),
    };
  }

  private toMidnight(date: Date): Date {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
  }

  private toYmd(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
