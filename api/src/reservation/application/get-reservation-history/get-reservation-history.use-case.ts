import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import { ReservationRepository } from '../../domain/reservation.repository';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { GetReservationHistoryQuery } from './get-reservation-history.query';
import type {
  DailySlotHistory,
  GetReservationHistoryResult,
} from './get-reservation-history.result';

export class GetReservationHistoryUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly parkingSpotRepository: ParkingSpotRepository,
  ) {}

  public async execute(
    query: GetReservationHistoryQuery,
  ): Promise<GetReservationHistoryResult> {
    const start = this.toMidnight(query.start);
    const end = this.toMidnight(query.end);

    if (end < start) {
      throw new BadRequestException('end must be after start.');
    }

    const allSpots = await this.parkingSpotRepository.findAll();
    const allSpotIds = allSpots.map((s) => s.id);

    const statusesToCountAsUsed = [
      ReservationStatus.Booked,
      ReservationStatus.CheckedIn,
      ReservationStatus.Released,
    ];

    const reservations = await this.reservationRepository.findByDateRange({
      start,
      end,
      statuses: statusesToCountAsUsed,
    });

    const byDaySlot = new Map<string, Set<string>>();
    for (const r of reservations) {
      if (query.slot && r.slot !== query.slot) continue;

      const key = `${this.toYmd(r.date)}|${r.slot}`;
      if (!byDaySlot.has(key)) byDaySlot.set(key, new Set());
      byDaySlot.get(key)!.add(r.spotId.value);
    }

    const slotsToReturn = query.slot
      ? [query.slot]
      : [ReservationSlot.AM, ReservationSlot.PM];

    const result: DailySlotHistory[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      for (const slot of slotsToReturn) {
        const key = `${this.toYmd(cursor)}|${slot}`;
        const used = Array.from(byDaySlot.get(key) ?? []);
        const usedSet = new Set(used);
        const freeParkingSpots = allSpotIds.filter(
          (id) => !usedSet.has(id.value),
        );

        result.push({
          date: this.toYmd(cursor),
          slot,
          usedSpotIds: used.sort(),
          freeSpotIds: freeParkingSpots.sort().map((id) => id.value),
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  private toMidnight(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toYmd(date: Date): string {
    const d = this.toMidnight(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
