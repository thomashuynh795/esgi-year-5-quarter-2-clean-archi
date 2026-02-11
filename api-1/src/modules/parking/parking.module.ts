
import { Module } from '@nestjs/common';
import { ParkingController } from './interfaces/http/parking.controller';
import { MakeReservationService } from './application/MakeReservation.service';
import { CheckInService } from './application/CheckIn.service';
import { CancelReservationService } from './application/CancelReservation.service';
import { GetAvailableSlotsService } from './application/GetAvailableSlots.service';
import { GetUserReservationsService } from './application/GetUserReservations.service';
import { PrismaReservationRepository } from './infrastructure/PrismaReservationRepository';
import { PrismaParkingSlotRepository } from './infrastructure/PrismaParkingSlotRepository';
import { RESERVATION_REPOSITORY } from './domain/ReservationRepository';
import { PARKING_SLOT_REPOSITORY } from './domain/ParkingSlotRepository';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [ParkingController],
    providers: [
        MakeReservationService,
        CheckInService,
        CancelReservationService,
        GetAvailableSlotsService,
        GetUserReservationsService,
        {
            provide: RESERVATION_REPOSITORY,
            useClass: PrismaReservationRepository,
        },
        {
            provide: PARKING_SLOT_REPOSITORY,
            useClass: PrismaParkingSlotRepository,
        },
    ],
    exports: [],
})
export class ParkingModule { }
