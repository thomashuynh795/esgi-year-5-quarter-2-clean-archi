import type { ParkingSpotRepository } from '../../domain/parking-spot.repository';
import { makeParkingSpot } from '../../../test-utils/factories';
import { GetElectricSpotsUseCase } from './get-electric-spots.use-case';

describe('GetElectricSpotsUseCase', () => {
  it('returns only charger-enabled spots', async () => {
    const spots = [makeParkingSpot(), makeParkingSpot({ row: 'F', number: 2 })];
    const parkingSpotRepository: ParkingSpotRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByRow: jest.fn(),
      findByChargerAvailability: jest.fn().mockResolvedValue(spots),
    };

    const useCase = new GetElectricSpotsUseCase(parkingSpotRepository);

    await expect(useCase.execute()).resolves.toBe(spots);
    expect(parkingSpotRepository.findByChargerAvailability).toHaveBeenCalledWith(
      true,
    );
  });
});
