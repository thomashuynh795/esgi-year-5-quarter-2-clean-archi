import type { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import type { ReservationRepository } from '../../../reservation/domain/reservation.repository';
import { ReservationSlot } from '../../../reservation/domain/enums/reservation-slot.enum';
import { ReservationStatus } from '../../../reservation/domain/enums/reservation-status.enum';
import { makeParkingSpot, makeReservation } from '../../../test-utils/factories';
import { GetStatisticsUseCase } from './get-statistics.use-case';

describe('GetStatisticsUseCase', () => {
  it('computes snapshot and monthly statistics', async () => {
    const referenceDate = new Date('2026-03-04T12:00:00.000Z');
    const spots = [
      makeParkingSpot({ row: 'A', number: 1 }),
      makeParkingSpot({ row: 'A', number: 2 }),
      makeParkingSpot({ row: 'B', number: 1, hasCharger: false }),
      makeParkingSpot({ row: 'B', number: 2, hasCharger: false }),
    ];
    const dailyReservations = [
      makeReservation({
        id: 'r1',
        spotId: 'A01',
        status: ReservationStatus.Booked,
        needsCharging: true,
      }),
      makeReservation({
        id: 'r2',
        spotId: 'B01',
        status: ReservationStatus.CheckedIn,
      }),
      makeReservation({
        id: 'r3',
        spotId: 'B02',
        status: ReservationStatus.NoShow,
        slot: ReservationSlot.PM,
      }),
    ];
    const monthlyReservations = [
      makeReservation({ id: 'm1', date: new Date('2026-03-03'), status: ReservationStatus.Booked }),
      makeReservation({ id: 'm2', date: new Date('2026-03-03'), status: ReservationStatus.CheckedIn }),
      makeReservation({ id: 'm3', date: new Date('2026-03-04'), status: ReservationStatus.NoShow }),
      makeReservation({ id: 'm4', date: new Date('2026-03-05'), status: ReservationStatus.Released }),
    ];

    const reservationRepository: ReservationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      findBySpot: jest.fn(),
      findConflicting: jest.fn(),
      findConflictingSpot: jest.fn(),
      saveCheckIn: jest.fn(),
      findUnconfirmedBookings: jest.fn(),
      findReservationsByDatesAndSlot: jest.fn(),
      findByDate: jest.fn().mockResolvedValue(dailyReservations),
      findByDateRange: jest
        .fn()
        .mockResolvedValueOnce(monthlyReservations)
        .mockResolvedValueOnce(monthlyReservations),
      countDistinctActiveDatesFrom: jest.fn(),
      findByUserSpotDateSlot: jest.fn(),
      findReservationsForMonth: jest.fn(),
      existsConflict: jest.fn(),
    };
    const parkingSpotRepository: ParkingSpotRepository = {
      findAll: jest.fn().mockResolvedValue(spots),
      findById: jest.fn(),
      findByRow: jest.fn(),
      findByChargerAvailability: jest.fn(),
    };

    const useCase = new GetStatisticsUseCase(
      reservationRepository,
      parkingSpotRepository,
    );

    const result = await useCase.execute(referenceDate);

    expect(result.totalSpots).toBe(4);
    expect(result.electricSpots).toBe(2);
    expect(result.totalReservations).toBe(2);
    expect(result.totalCheckIns).toBe(1);
    expect(result.totalNoShows).toBe(1);
    expect(result.chargerUsageRate).toBe('50.00%');
    expect(result.monthlyReservationCount).toBe(4);
    expect(result.peakDailyReservationsInMonth).toBe(2);
    expect(result.monthLabel).toBe('mars 2026');
  });
});
