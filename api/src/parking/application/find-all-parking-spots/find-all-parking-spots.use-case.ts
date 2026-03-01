import { ParkingSpot } from '../../domain/parking-spot.entity';
import { ParkingSpotRepository } from '../../domain/parking-spot.repository';

export class FindAllParkingSpotsUseCase {
  public constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
  ) {}

  public async execute(): Promise<ParkingSpot[]> {
    return await this.parkingSpotRepository.findAll();
  }
}
