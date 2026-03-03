import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import type { ParkingSpotRepository } from '../../domain/parking-spot.repository';
import { makeParkingSpot } from '../../../test-utils/factories';
import { FindSpotByIdUseCase } from './find-spot-by-id.use-case';

describe('FindSpotByIdUseCase', () => {
  it('returns the requested spot when it exists', async () => {
    const spot = makeParkingSpot();
    const parkingSpotRepository: ParkingSpotRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(spot),
      findByRow: jest.fn(),
      findByChargerAvailability: jest.fn(),
    };

    const useCase = new FindSpotByIdUseCase(parkingSpotRepository);

    await expect(useCase.execute('A01')).resolves.toBe(spot);
  });

  it('throws when the spot does not exist', async () => {
    const parkingSpotRepository: ParkingSpotRepository = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      findByRow: jest.fn(),
      findByChargerAvailability: jest.fn(),
    };

    const useCase = new FindSpotByIdUseCase(parkingSpotRepository);

    await expect(useCase.execute('A01')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
