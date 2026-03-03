import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import type { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import type { ReservationRepository } from '../../domain/reservation.repository';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { makeParkingSpot, makeReservation } from '../../../test-utils/factories';
import { GetDailyOccupancyUseCase } from './get-daily-occupancy.use-case';

describe('GetDailyOccupancyUseCase', () => {
  it('returns AM/PM availability by spot', async () => {
    const parkingSpotRepository: ParkingSpotRepository = {
      findAll: jest.fn().mockResolvedValue([
        makeParkingSpot(),
        makeParkingSpot({ row: 'B', number: 1, hasCharger: false }),
      ]),
      findById: jest.fn(),
      findByRow: jest.fn(),
      findByChargerAvailability: jest.fn(),
    };
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
      findByDate: jest.fn(),
      findByDateRange: jest.fn().mockResolvedValue([
        makeReservation({
          spotId: 'A01',
          slot: ReservationSlot.AM,
          status: ReservationStatus.Booked,
        }),
      ]),
      countDistinctActiveDatesFrom: jest.fn(),
      findByUserSpotDateSlot: jest.fn(),
      findReservationsForMonth: jest.fn(),
      existsConflict: jest.fn(),
    };

    const useCase = new GetDailyOccupancyUseCase(
      reservationRepository,
      parkingSpotRepository,
    );

    const result = await useCase.execute(new Date('2026-03-04T18:00:00.000Z'));

    expect(result.date).toBe('2026-03-04');
    expect(result.spots[0]).toMatchObject({
      spotId: 'A01',
      isAvailableAM: false,
      isAvailablePM: true,
    });
  });

  it('throws for invalid dates', async () => {
    const useCase = new GetDailyOccupancyUseCase(
      { findByDateRange: jest.fn(), save: jest.fn(), findById: jest.fn(), findByUser: jest.fn(), findBySpot: jest.fn(), findConflicting: jest.fn(), findConflictingSpot: jest.fn(), saveCheckIn: jest.fn(), findUnconfirmedBookings: jest.fn(), findReservationsByDatesAndSlot: jest.fn(), findByDate: jest.fn(), countDistinctActiveDatesFrom: jest.fn(), findByUserSpotDateSlot: jest.fn(), findReservationsForMonth: jest.fn(), existsConflict: jest.fn() },
      { findAll: jest.fn(), findById: jest.fn(), findByRow: jest.fn(), findByChargerAvailability: jest.fn() },
    );

    await expect(useCase.execute(new Date('invalid'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
