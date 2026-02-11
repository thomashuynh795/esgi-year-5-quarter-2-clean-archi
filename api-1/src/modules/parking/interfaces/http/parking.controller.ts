
import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MakeReservationService } from '../../application/MakeReservation.service';
import { CheckInService } from '../../application/CheckIn.service';
import { CancelReservationService } from '../../application/CancelReservation.service';
import { GetAvailableSlotsService } from '../../application/GetAvailableSlots.service';
import { GetUserReservationsService } from '../../application/GetUserReservations.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('parking')
@Controller('parking')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ParkingController {
    constructor(
        private makeReservationService: MakeReservationService,
        private checkInService: CheckInService,
        private cancelReservationService: CancelReservationService,
        private getAvailableSlotsService: GetAvailableSlotsService,
        private getUserReservationsService: GetUserReservationsService,
    ) { }

    @Post('reservations')
    @ApiOperation({ summary: 'Make a reservation' })
    async makeReservation(@Request() req, @Body() body: { slotId: number, startDate: string, period: 'AM' | 'PM', duration: number, needsCharging: boolean }) {
        return this.makeReservationService.execute(
            req.user.userId,
            body.slotId,
            new Date(body.startDate),
            body.period,
            body.duration,
            body.needsCharging,
        );
    }

    @Get('slots/available')
    @ApiOperation({ summary: 'Get available slots' })
    async getAvailableSlots(@Request() req, @Body() body: { startDate: string, period?: 'AM' | 'PM', duration: number }) {

        return this.getAvailableSlotsService.execute(
            new Date(req.query.startDate),
            req.query.period,
            req.query.duration ? parseInt(req.query.duration) : 1,
        );
    }

    @Get('reservations/user/:userId')
    @ApiOperation({ summary: 'Get user reservations' })
    async getUserReservations(@Param('userId', ParseIntPipe) userId: number) {
        return this.getUserReservationsService.execute(userId);
    }

    @Post('reservations/:id/check-in')
    @ApiOperation({ summary: 'Check-in a reservation' })
    async checkIn(@Param('id', ParseIntPipe) id: number) {
        return this.checkInService.execute(id);
    }

    @Delete('reservations/:id')
    @ApiOperation({ summary: 'Cancel a reservation' })
    async cancel(@Param('id', ParseIntPipe) id: number) {
        return this.cancelReservationService.execute(id);
    }
}
