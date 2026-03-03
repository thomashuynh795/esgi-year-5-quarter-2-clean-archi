import type { ReservationRepository } from '../../domain/reservation.repository';
import { makeReservation } from '../../../test-utils/factories';
import { GetUserReservationsUseCase } from './get-user-reservations.use-case';

describe('GetUserReservationsUseCase', () => {
  it('returns reservations for a user', async () => {
    const reservations = [makeReservation(), makeReservation({ id: 'res-2' })];
    const reservationRepository: ReservationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn().mockResolvedValue(reservations),
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
      findReservationsForMonth: jest.fn(),
      existsConflict: jest.fn(),
    };

    const useCase = new GetUserReservationsUseCase(reservationRepository);

    await expect(useCase.execute('user-1')).resolves.toBe(reservations);
  });
});
