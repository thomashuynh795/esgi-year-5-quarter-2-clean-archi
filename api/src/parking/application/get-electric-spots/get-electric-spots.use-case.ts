import { ParkingSpot } from '../../domain/parking-spot.entity';
import { ParkingSpotRepository } from '../../domain/parking-spot.repository';

export class GetElectricSpotsUseCase {
  public constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
  ) {}

  public async execute(): Promise<ParkingSpot[]> {
    return this.parkingSpotRepository.findByChargerAvailability(true);
  }
}
