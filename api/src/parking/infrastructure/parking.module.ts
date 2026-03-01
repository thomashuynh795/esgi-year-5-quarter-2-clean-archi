import { Module } from '@nestjs/common';
import {
  PARKING_SPOT_REPOSITORY,
  ParkingSpotRepository,
} from '../domain/parking-spot.repository';
import { ParkingSpotRepositoryPrismaAdapter } from './persistence/prisma-parking-spot.repository';
import { ParkingSpotController } from './web/parking-spot.controller';
import { DatabaseModule } from '../../database/infrastructure/database.module';
import { FindAllParkingSpotsUseCase } from '../application/find-all-parking-spots/find-all-parking-spots.use-case';
import { FindSpotByIdUseCase } from '../application/find-spot-by-id/find-spot-by-id.use-case';
import { GetElectricSpotsUseCase } from '../application/get-electric-spots/get-electric-spots.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [ParkingSpotController],
  providers: [
    {
      provide: PARKING_SPOT_REPOSITORY,
      useClass: ParkingSpotRepositoryPrismaAdapter,
    },
    {
      provide: FindAllParkingSpotsUseCase,
      useFactory: (parkingSpotRepository: ParkingSpotRepository) => {
        return new FindAllParkingSpotsUseCase(parkingSpotRepository);
      },
      inject: [PARKING_SPOT_REPOSITORY],
    },
    {
      provide: GetElectricSpotsUseCase,
      useFactory: (parkingSpotRepository: ParkingSpotRepository) => {
        return new GetElectricSpotsUseCase(parkingSpotRepository);
      },
      inject: [PARKING_SPOT_REPOSITORY],
    },
    {
      provide: FindSpotByIdUseCase,
      useFactory: (parkingSpotRepository: ParkingSpotRepository) => {
        return new FindSpotByIdUseCase(parkingSpotRepository);
      },
      inject: [PARKING_SPOT_REPOSITORY],
    },
  ],
  exports: [PARKING_SPOT_REPOSITORY],
})
export class ParkingModule {}
