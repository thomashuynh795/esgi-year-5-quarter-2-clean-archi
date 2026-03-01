import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/infrastructure/database.module';
import { AuthModule } from './auth/infrastructure/auth.module';
import { ParkingModule } from './parking/infrastructure/parking.module';
import { ReservationModule } from './reservation/infrastructure/reservation.module';
import { DashboardModule } from './dashboard/infrastructure/dashboard.module';
import { ErrorHandlerService } from './shared/error/infrastructure/error-handler.service';
import { ErrorHandlerModule } from './shared/error/infrastructure/error-handler.module';
import { UserModule } from './user/infrastructure/user.module';
import { IdModule } from './shared/id/infrastructure/id.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    ParkingModule,
    ReservationModule,
    DashboardModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ErrorHandlerModule,
    IdModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorHandlerService],
})
export class AppModule {}
