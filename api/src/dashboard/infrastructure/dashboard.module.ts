import { Module } from '@nestjs/common';
import { GetStatisticsUseCase } from '../application/get-statistics/get-statistics.use-case';
import { DashboardController } from './web/dashboard.controller';
import { ReservationModule } from '../../reservation/infrastructure/reservation.module';
import { ParkingModule } from '../../parking/infrastructure/parking.module';
import { DatabaseModule } from '../../database/infrastructure/database.module';
import {
  RESERVATION_REPOSITORY,
  ReservationRepository,
} from '../../reservation/domain/reservation.repository';
import {
  PARKING_SPOT_REPOSITORY,
  ParkingSpotRepository,
} from '../../parking/domain/parking-spot.repository';

@Module({
  imports: [DatabaseModule, ReservationModule, ParkingModule],
  controllers: [DashboardController],
  providers: [
    {
      provide: GetStatisticsUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        parkingSpotRepository: ParkingSpotRepository,
      ) =>
        new GetStatisticsUseCase(reservationRepository, parkingSpotRepository),
      inject: [RESERVATION_REPOSITORY, PARKING_SPOT_REPOSITORY],
    },
  ],
})
export class DashboardModule {}
