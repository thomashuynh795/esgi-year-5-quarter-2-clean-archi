import type { ReservationRepository } from '../../domain/reservation.repository';
import { makeReservation } from '../../../test-utils/factories';
import { GetReservationsForMonthUseCase } from './get-reservations-for-month.use-case';

describe('GetReservationsForMonthUseCase', () => {
  it('returns reservations for the requested month', async () => {
    const reservations = [makeReservation()];
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
      findByDateRange: jest.fn(),
      countDistinctActiveDatesFrom: jest.fn(),
      findByUserSpotDateSlot: jest.fn(),
      findReservationsForMonth: jest.fn().mockResolvedValue(reservations),
      existsConflict: jest.fn(),
    };

    const useCase = new GetReservationsForMonthUseCase(reservationRepository);

    await expect(useCase.execute(2026, 3)).resolves.toBe(reservations);
    expect(reservationRepository.findReservationsForMonth).toHaveBeenCalledWith(
      2026,
      3,
    );
  });
});
