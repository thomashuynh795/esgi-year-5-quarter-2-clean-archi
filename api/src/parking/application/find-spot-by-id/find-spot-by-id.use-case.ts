import { ParkingSpotId } from '../../../reservation/domain/classes/parking-spot-id.class';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { ParkingSpot } from '../../domain/parking-spot.entity';
import { ParkingSpotRepository } from '../../domain/parking-spot.repository';

export class FindSpotByIdUseCase {
  public constructor(
    private readonly parkingSpotRepository: ParkingSpotRepository,
  ) {}

  async execute(id: string): Promise<ParkingSpot> {
    const spot = await this.parkingSpotRepository.findById(
      ParkingSpotId.of(id),
    );

    if (!spot) {
      throw new NotFoundException(`Parking spot with ID ${id} not found.`);
    }

    return spot;
  }
}
