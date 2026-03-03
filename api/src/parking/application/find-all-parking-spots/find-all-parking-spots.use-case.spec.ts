import type { ParkingSpotRepository } from '../../domain/parking-spot.repository';
import { makeParkingSpot } from '../../../test-utils/factories';
import { FindAllParkingSpotsUseCase } from './find-all-parking-spots.use-case';

describe('FindAllParkingSpotsUseCase', () => {
  it('returns every parking spot from the repository', async () => {
    const spots = [
      makeParkingSpot(),
      makeParkingSpot({ row: 'B', number: 2, hasCharger: false }),
    ];
    const parkingSpotRepository: ParkingSpotRepository = {
      findAll: jest.fn().mockResolvedValue(spots),
      findById: jest.fn(),
      findByRow: jest.fn(),
      findByChargerAvailability: jest.fn(),
    };

    const useCase = new FindAllParkingSpotsUseCase(parkingSpotRepository);

    await expect(useCase.execute()).resolves.toBe(spots);
  });
});
