import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import type { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import type { ReservationRepository } from '../../domain/reservation.repository';
import { GetReservationHistoryQuery } from './get-reservation-history.query';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { makeParkingSpot, makeReservation } from '../../../test-utils/factories';
import { GetReservationHistoryUseCase } from './get-reservation-history.use-case';

describe('GetReservationHistoryUseCase', () => {
  it('builds used and free spots for each day and slot', async () => {
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
          status: ReservationStatus.CheckedIn,
          date: new Date('2026-03-04'),
        }),
      ]),
      countDistinctActiveDatesFrom: jest.fn(),
      findByUserSpotDateSlot: jest.fn(),
      findReservationsForMonth: jest.fn(),
      existsConflict: jest.fn(),
    };

    const useCase = new GetReservationHistoryUseCase(
      reservationRepository,
      parkingSpotRepository,
    );

    const result = await useCase.execute(
      new GetReservationHistoryQuery(
        new Date('2026-03-04'),
        new Date('2026-03-04'),
      ),
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      date: '2026-03-04',
      slot: 'AM',
      usedSpotIds: ['A01'],
      freeSpotIds: ['B01'],
    });
    expect(result[1]).toMatchObject({
      date: '2026-03-04',
      slot: 'PM',
      usedSpotIds: [],
      freeSpotIds: ['A01', 'B01'],
    });
  });

  it('rejects inverted date ranges', async () => {
    const useCase = new GetReservationHistoryUseCase(
      { findByDateRange: jest.fn(), save: jest.fn(), findById: jest.fn(), findByUser: jest.fn(), findBySpot: jest.fn(), findConflicting: jest.fn(), findConflictingSpot: jest.fn(), saveCheckIn: jest.fn(), findUnconfirmedBookings: jest.fn(), findReservationsByDatesAndSlot: jest.fn(), findByDate: jest.fn(), countDistinctActiveDatesFrom: jest.fn(), findByUserSpotDateSlot: jest.fn(), findReservationsForMonth: jest.fn(), existsConflict: jest.fn() },
      { findAll: jest.fn(), findById: jest.fn(), findByRow: jest.fn(), findByChargerAvailability: jest.fn() },
    );

    await expect(
      useCase.execute(
        new GetReservationHistoryQuery(
          new Date('2026-03-05'),
          new Date('2026-03-04'),
        ),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
