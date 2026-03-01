import type { ParkingSpot as PrismaParkingSpot } from '@prisma/client';
import { ParkingSpot } from '../../../domain/parking-spot.entity';
import { ParkingSpotId } from '../../../../reservation/domain/classes/parking-spot-id.class';

export class ParkingSpotPrismaMapper {
  static toDomain(prismaSpot: PrismaParkingSpot): ParkingSpot {
    return new ParkingSpot({
      id: ParkingSpotId.of(prismaSpot.id),
      row: prismaSpot.row,
      number: prismaSpot.number,
      hasCharger: prismaSpot.hasCharger,
      isActive: prismaSpot.isActive,
      createdAt: prismaSpot.createdAt,
      updatedAt: prismaSpot.updatedAt,
    });
  }
}
