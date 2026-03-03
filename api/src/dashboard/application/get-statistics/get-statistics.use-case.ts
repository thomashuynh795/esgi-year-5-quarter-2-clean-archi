import type { ReservationRepository } from '../../../reservation/domain/reservation.repository';
import type { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import { ReservationStatus } from '../../../reservation/domain/enums/reservation-status.enum';
import { Reservation } from '../../../reservation/domain/classes/reservation.class';

export class GetStatisticsUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly parkingSpotRepository: ParkingSpotRepository,
  ) {}

  public async execute(date: Date) {
    const spots = await this.parkingSpotRepository.findAll();
    const totalSpots = spots.length;
    let electricSpots = 0;

    for (const spot of spots) {
      if (spot.isElectric()) electricSpots++;
    }

    const reservations: Reservation[] =
      await this.reservationRepository.findByDate(date);

    const activeReservations = reservations.filter((r) => {
      const requiredStatus: ReservationStatus[] = [
        ReservationStatus.Booked,
        ReservationStatus.CheckedIn,
      ];
      return requiredStatus.includes(r.status);
    });

    const totalReservations = activeReservations.length;
    const totalCheckIns = activeReservations.filter(
      (r) => r.status === ReservationStatus.CheckedIn,
    ).length;
    const totalNoShows = reservations.filter(
      (r) => r.status === ReservationStatus.NoShow,
    ).length;
    const totalChargerRequests = activeReservations.filter(
      (r) => r.needsCharger,
    ).length;

    const windowDays = 30;
    const windowEnd = new Date(date);
    windowEnd.setHours(0, 0, 0, 0);
    const windowStart = new Date(windowEnd);
    windowStart.setDate(windowStart.getDate() - (windowDays - 1));

    const windowReservations = await this.reservationRepository.findByDateRange(
      {
        start: windowStart,
        end: windowEnd,
        statuses: [
          ReservationStatus.Booked,
          ReservationStatus.CheckedIn,
          ReservationStatus.NoShow,
          ReservationStatus.Released,
        ],
      },
    );

    const perDay = new Map<string, Reservation[]>();
    for (const r of windowReservations) {
      const key = new Date(r.date).toISOString().slice(0, 10);
      const list = perDay.get(key) ?? [];
      list.push(r);
      perDay.set(key, list);
    }

    let sumReservations = 0;
    let sumCheckIns = 0;
    for (let i = 0; i < windowDays; i++) {
      const d = new Date(windowStart);
      d.setDate(windowStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const dayReservations = perDay.get(key) ?? [];
      sumReservations += dayReservations.length;
      sumCheckIns += dayReservations.filter(
        (r) => r.status === ReservationStatus.CheckedIn,
      ).length;
    }

    const avgReservationsPerDay =
      windowDays > 0 ? sumReservations / windowDays : 0;
    const avgCheckInsPerDay = windowDays > 0 ? sumCheckIns / windowDays : 0;

    const fillingRate = totalSpots > 0 ? totalReservations / totalSpots : 0;
    const denominatorForNoShow = totalReservations + totalNoShows;
    const noShowRate =
      denominatorForNoShow > 0 ? totalNoShows / denominatorForNoShow : 0;
    const electricRate = totalSpots > 0 ? electricSpots / totalSpots : 0;
    const chargerUsageRate =
      totalReservations > 0 ? totalChargerRequests / totalReservations : 0;
    const averageUsageRate =
      totalSpots > 0 ? avgReservationsPerDay / totalSpots : 0;
    const averageCheckInRate =
      totalSpots > 0 ? avgCheckInsPerDay / totalSpots : 0;

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthlyReservations =
      await this.reservationRepository.findByDateRange({
        start: monthStart,
        end: monthEnd,
        statuses: [
          ReservationStatus.Booked,
          ReservationStatus.CheckedIn,
          ReservationStatus.NoShow,
          ReservationStatus.Released,
        ],
      });

    const monthlyByDay = new Map<string, Reservation[]>();
    for (const reservation of monthlyReservations) {
      const key = new Date(reservation.date).toISOString().slice(0, 10);
      const items = monthlyByDay.get(key) ?? [];
      items.push(reservation);
      monthlyByDay.set(key, items);
    }

    const workingDaysInMonth = this.countWorkingDaysBetween(
      monthStart,
      monthEnd,
    );
    const monthlyReservationCount = monthlyReservations.length;
    const monthlyCheckInCount = monthlyReservations.filter(
      (reservation) => reservation.status === ReservationStatus.CheckedIn,
    ).length;
    const monthlyNoShowCount = monthlyReservations.filter(
      (reservation) => reservation.status === ReservationStatus.NoShow,
    ).length;
    const peakDailyReservationsInMonth = Array.from(
      monthlyByDay.values(),
    ).reduce((max, items) => Math.max(max, items.length), 0);
    const averageReservationsPerWorkingDayInMonth =
      workingDaysInMonth > 0 ? monthlyReservationCount / workingDaysInMonth : 0;
    const averageCheckInsPerWorkingDayInMonth =
      workingDaysInMonth > 0 ? monthlyCheckInCount / workingDaysInMonth : 0;
    const monthlyAverageOccupancyRate =
      totalSpots > 0 ? averageReservationsPerWorkingDayInMonth / totalSpots : 0;
    const monthlyPeakOccupancyRate =
      totalSpots > 0 ? peakDailyReservationsInMonth / totalSpots : 0;

    return {
      date: date.toISOString(),
      monthLabel: date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      }),
      totalSpots,
      electricSpots,
      totalReservations,
      totalCheckIns,
      totalNoShows,
      totalChargerRequests,
      fillingRate: (fillingRate * 100).toFixed(2) + '%',
      noShowRate: (noShowRate * 100).toFixed(2) + '%',
      electricRate: (electricRate * 100).toFixed(2) + '%',
      chargerUsageRate: (chargerUsageRate * 100).toFixed(2) + '%',
      averageUsageRateLast30Days: (averageUsageRate * 100).toFixed(2) + '%',
      averageCheckInRateLast30Days: (averageCheckInRate * 100).toFixed(2) + '%',
      monthlyReservationCount,
      monthlyCheckInCount,
      monthlyNoShowCount,
      workingDaysInMonth,
      averageReservationsPerWorkingDayInMonth: Number(
        averageReservationsPerWorkingDayInMonth.toFixed(1),
      ),
      averageCheckInsPerWorkingDayInMonth: Number(
        averageCheckInsPerWorkingDayInMonth.toFixed(1),
      ),
      peakDailyReservationsInMonth,
      monthlyAverageOccupancyRate:
        (monthlyAverageOccupancyRate * 100).toFixed(2) + '%',
      monthlyPeakOccupancyRate:
        (monthlyPeakOccupancyRate * 100).toFixed(2) + '%',
    };
  }

  private countWorkingDaysBetween(start: Date, end: Date): number {
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);

    const last = new Date(end);
    last.setHours(0, 0, 0, 0);

    let count = 0;
    while (cursor.getTime() <= last.getTime()) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return count;
  }
}
