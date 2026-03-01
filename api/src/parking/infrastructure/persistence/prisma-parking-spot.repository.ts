import { Injectable } from '@nestjs/common';
import { ParkingSpotRepository } from '../../domain/parking-spot.repository';
import { ParkingSpot } from '../../domain/parking-spot.entity';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import { ParkingSpotPrismaMapper } from './mappers/prisma-parking-spot.mapper';
import { ParkingSpotId } from '../../../reservation/domain/classes/parking-spot-id.class';

@Injectable()
export class ParkingSpotRepositoryPrismaAdapter implements ParkingSpotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ParkingSpot[]> {
    const spots = await this.prisma.parkingSpot.findMany({
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    });
    return spots.map((spot) => ParkingSpotPrismaMapper.toDomain(spot));
  }

  async findById(parkingSpotId: ParkingSpotId): Promise<ParkingSpot | null> {
    const spot = await this.prisma.parkingSpot.findUnique({
      where: { id: parkingSpotId.value },
    });
    return spot ? ParkingSpotPrismaMapper.toDomain(spot) : null;
  }

  async findByRow(row: string): Promise<ParkingSpot[]> {
    const spots = await this.prisma.parkingSpot.findMany({
      where: { row: row.toUpperCase() },
      orderBy: { number: 'asc' },
    });
    return spots.map((spot) => ParkingSpotPrismaMapper.toDomain(spot));
  }

  async findByChargerAvailability(hasCharger: boolean): Promise<ParkingSpot[]> {
    const spots = await this.prisma.parkingSpot.findMany({
      where: { hasCharger },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    });
    return spots.map((spot) => ParkingSpotPrismaMapper.toDomain(spot));
  }
}
