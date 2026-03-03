import type { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import type { ReservationRepository } from '../../domain/reservation.repository';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { makeParkingSpot, makeReservation } from '../../../test-utils/factories';
import { GetAvailableSlotsUseCase } from './get-available-slots.use-case';

describe('GetAvailableSlotsUseCase', () => {
  it('skips weekends and excludes reserved spots', async () => {
    const allSpots = [
      makeParkingSpot(),
      makeParkingSpot({ row: 'B', number: 1, hasCharger: false }),
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
      findReservationsByDatesAndSlot: jest
        .fn()
        .mockResolvedValue([makeReservation({ spotId: 'A01' })]),
      findByDate: jest.fn(),
      findByDateRange: jest.fn(),
      countDistinctActiveDatesFrom: jest.fn(),
      findByUserSpotDateSlot: jest.fn(),
      findReservationsForMonth: jest.fn(),
      existsConflict: jest.fn(),
    };
    const parkingSpotRepository: ParkingSpotRepository = {
      findAll: jest.fn().mockResolvedValue(allSpots),
      findById: jest.fn(),
      findByRow: jest.fn(),
      findByChargerAvailability: jest.fn(),
    };

    const useCase = new GetAvailableSlotsUseCase(
      reservationRepository,
      parkingSpotRepository,
    );

    const result = await useCase.execute('2026-03-06', ReservationSlot.AM, 2);

    expect(
      reservationRepository.findReservationsByDatesAndSlot,
    ).toHaveBeenCalledWith(
      [new Date('2026-03-06T00:00:00.000Z'), new Date('2026-03-09T00:00:00.000Z')],
      ReservationSlot.AM,
    );
    expect(result.map((spot) => spot.id.value)).toEqual(['B01']);
  });
});
