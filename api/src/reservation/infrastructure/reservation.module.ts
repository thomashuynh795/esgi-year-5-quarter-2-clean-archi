import { Module } from '@nestjs/common';
import { ReservationRepositoryPrismaAdapter } from './persistence/reservation-repository-prisma.adapter';
import { QUEUE_PORT } from '../application/ports/queue.port';
import { RabbitMQQueueAdapter } from './adapters/rabbitmq-queue.adapter';
import { ReservationController } from './web/reservation.controller';
import { NoShowCron } from './cron/no-show.cron';
import { ReservationOutboxPublisher } from './cron/outbox-publisher.cron';
import { DatabaseModule } from '../../database/infrastructure/database.module';
import { ParkingModule } from '../../parking/infrastructure/parking.module';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../user/domain/user.repository';
import { ID_GENERATOR, IdGenerator } from '../../shared/id/domain/id-generator';
import { CreateReservationUseCase } from '../application/create-reservation/create-reservation.use-case';
import { UserModule } from '../../user/infrastructure/user.module';
import {
  PARKING_SPOT_REPOSITORY,
  ParkingSpotRepository,
} from '../../parking/domain/parking-spot.repository';
import {
  RESERVATION_REPOSITORY,
  ReservationRepository,
} from '../domain/reservation.repository';
import { IdModule } from '../../shared/id/infrastructure/id.module';
import { GetUserReservationsUseCase } from '../application/get-user-reservations/get-user-reservations.use-case';
import { CancelReservationUseCase } from '../application/cancel-reservation/cancel-reservation.use-case';
import { GetReservationsForMonthUseCase } from '../application/get-reservations-for-month/get-reservations-for-month.use-case';
import { GetAvailableSlotsUseCase } from '../application/get-available-slots/get-available-slots.use-case';
import { GetReservationHistoryUseCase } from '../application/get-reservation-history/get-reservation-history.use-case';
import { GetDailyOccupancyUseCase } from '../application/get-daily-occupancy/get-daily-occupancy.use-case';
import { CheckInUseCase } from '../application/check-in/check-in.use-case';
import { CheckInByQrUseCase } from '../application/check-in/check-in-by-qr.use-case';
import { UpdateReservationUseCase } from '../application/update-reservation/update-reservation.use-case';
import { OUTBOX_PORT } from '../application/ports/outbox.port';
import { OutboxPrismaAdapter } from './persistence/outbox-prisma.adapter';
import type { OutboxPort } from '../application/ports/outbox.port';
import { RESERVATION_EVENT_PORT } from '../application/ports/reservation-event.port';
import type { ReservationEventPort } from '../application/ports/reservation-event.port';
import { ReservationEventPrismaAdapter } from './persistence/reservation-event-prisma.adapter';

@Module({
  imports: [DatabaseModule, ParkingModule, UserModule, IdModule],
  controllers: [ReservationController],
  providers: [
    NoShowCron,
    ReservationOutboxPublisher,
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationRepositoryPrismaAdapter,
    },
    {
      provide: QUEUE_PORT,
      useClass: RabbitMQQueueAdapter,
    },
    {
      provide: OUTBOX_PORT,
      useClass: OutboxPrismaAdapter,
    },
    {
      provide: RESERVATION_EVENT_PORT,
      useClass: ReservationEventPrismaAdapter,
    },
    {
      provide: CreateReservationUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        parkingSpotRepository: ParkingSpotRepository,
        userRepository: UserRepository,
        idGenerator: IdGenerator,
        outbox: OutboxPort,
        reservationEvents: ReservationEventPort,
      ) =>
        new CreateReservationUseCase(
          reservationRepository,
          parkingSpotRepository,
          userRepository,
          idGenerator,
          outbox,
          reservationEvents,
        ),
      inject: [
        RESERVATION_REPOSITORY,
        PARKING_SPOT_REPOSITORY,
        USER_REPOSITORY,
        ID_GENERATOR,
        OUTBOX_PORT,
        RESERVATION_EVENT_PORT,
      ],
    },
    {
      provide: GetUserReservationsUseCase,
      useFactory: (reservationRepository: ReservationRepository) =>
        new GetUserReservationsUseCase(reservationRepository),
      inject: [RESERVATION_REPOSITORY],
    },
    {
      provide: CancelReservationUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        userRepository: UserRepository,
        reservationEvents: ReservationEventPort,
      ) =>
        new CancelReservationUseCase(
          reservationRepository,
          userRepository,
          reservationEvents,
        ),
      inject: [RESERVATION_REPOSITORY, USER_REPOSITORY, RESERVATION_EVENT_PORT],
    },
    {
      provide: GetReservationsForMonthUseCase,
      useFactory: (reservationRepository: ReservationRepository) =>
        new GetReservationsForMonthUseCase(reservationRepository),
      inject: [RESERVATION_REPOSITORY],
    },
    {
      provide: GetAvailableSlotsUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        parkingSpotRepository: ParkingSpotRepository,
      ) =>
        new GetAvailableSlotsUseCase(
          reservationRepository,
          parkingSpotRepository,
        ),
      inject: [RESERVATION_REPOSITORY, PARKING_SPOT_REPOSITORY],
    },

    {
      provide: GetReservationHistoryUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        parkingSpotRepository: ParkingSpotRepository,
      ) =>
        new GetReservationHistoryUseCase(
          reservationRepository,
          parkingSpotRepository,
        ),
      inject: [RESERVATION_REPOSITORY, PARKING_SPOT_REPOSITORY],
    },
    {
      provide: GetDailyOccupancyUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        parkingSpotRepository: ParkingSpotRepository,
      ) =>
        new GetDailyOccupancyUseCase(
          reservationRepository,
          parkingSpotRepository,
        ),
      inject: [RESERVATION_REPOSITORY, PARKING_SPOT_REPOSITORY],
    },
    {
      provide: CheckInUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        userRepository: UserRepository,
        idGenerator: IdGenerator,
        reservationEvents: ReservationEventPort,
      ) =>
        new CheckInUseCase(
          reservationRepository,
          userRepository,
          idGenerator,
          reservationEvents,
        ),
      inject: [
        RESERVATION_REPOSITORY,
        USER_REPOSITORY,
        ID_GENERATOR,
        RESERVATION_EVENT_PORT,
      ],
    },
    {
      provide: CheckInByQrUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        idGenerator: IdGenerator,
        reservationEvents: ReservationEventPort,
      ) =>
        new CheckInByQrUseCase(
          reservationRepository,
          idGenerator,
          reservationEvents,
        ),
      inject: [RESERVATION_REPOSITORY, ID_GENERATOR, RESERVATION_EVENT_PORT],
    },
    {
      provide: UpdateReservationUseCase,
      useFactory: (
        reservationRepository: ReservationRepository,
        parkingSpotRepository: ParkingSpotRepository,
        userRepository: UserRepository,
        reservationEvents: ReservationEventPort,
      ) =>
        new UpdateReservationUseCase(
          reservationRepository,
          parkingSpotRepository,
          userRepository,
          reservationEvents,
        ),
      inject: [
        RESERVATION_REPOSITORY,
        PARKING_SPOT_REPOSITORY,
        USER_REPOSITORY,
        RESERVATION_EVENT_PORT,
      ],
    },
  ],
  exports: [RESERVATION_REPOSITORY],
})
export class ReservationModule {}
