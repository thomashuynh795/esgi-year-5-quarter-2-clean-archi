import {
  Controller,
  Req,
  UseGuards,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Delete,
  Query,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwtAuthGuard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../user/domain/enums/user-role.enum';
import type { CustomizedExpressRequest } from '../../../shared/types/customized-express-request';
import { CreateReservationRequestDto } from './dtos/create-reservation.request.dto';
import { CreateReservationUseCase } from '../../application/create-reservation/create-reservation.use-case';
import { CreateReservationCommand } from '../../application/create-reservation/create-reservation.command';
import { ParkingSpotId } from '../../domain/classes/parking-spot-id.class';
import { GetUserReservationsUseCase } from '../../application/get-user-reservations/get-user-reservations.use-case';
import { CancelReservationUseCase } from '../../application/cancel-reservation/cancel-reservation.use-case';
import { GetReservationsForMonthUseCase } from '../../application/get-reservations-for-month/get-reservations-for-month.use-case';
import { GetAvailableSlotsUseCase } from '../../application/get-available-slots/get-available-slots.use-case';
import { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { CheckInUseCase } from '../../application/check-in/check-in.use-case';
import { CheckInByQrUseCase } from '../../application/check-in/check-in-by-qr.use-case';
import { UpdateReservationUseCase } from '../../application/update-reservation/update-reservation.use-case';
import { GetReservationHistoryUseCase } from '../../application/get-reservation-history/get-reservation-history.use-case';
import { GetReservationHistoryQuery } from '../../application/get-reservation-history/get-reservation-history.query';
import { UpdateReservationRequestDto } from './dtos/update-reservation.request.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  public constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly getUserReservationsUseCase: GetUserReservationsUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    private readonly getReservationsForMonthUseCase: GetReservationsForMonthUseCase,
    private readonly getAvalableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly checkInUseCase: CheckInUseCase,
    private readonly checkInByQrUseCase: CheckInByQrUseCase,
    private readonly updateReservationUseCase: UpdateReservationUseCase,
    private readonly getReservationHistoryUseCase: GetReservationHistoryUseCase,
  ) {}

  @Post()
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async createReservation(
    @Req() req: CustomizedExpressRequest,
    @Body() dto: CreateReservationRequestDto,
  ) {
    const userId = req.user.id;

    const command = new CreateReservationCommand(
      userId,
      ParkingSpotId.of(dto.spotId),
      new Date(dto.startDate),
      dto.slot,
      dto.duration ?? 1,
      dto.needsCharging ?? false,
    );

    return this.createReservationUseCase.execute(command);
  }

  @Get('available')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async getAvailableSlots(
    @Query('date') date: string,
    @Query('period') period: ReservationSlot,
    @Query('duration') duration: string,
  ) {
    if (!date || !period || !duration) {
      throw new HttpException(
        'Missing required query parameters: date, period, duration',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.getAvalableSlotsUseCase.execute(
      date,
      period,
      parseInt(duration, 10),
    );
  }

  private mapToFrontendDto(res: any) {
    return {
      id: res.id,
      date: res.date,
      status: res.status,
      period: res.slot,
      slot: {
        id: res.spotId,
        name: res.spotId,
      },
    };
  }

  @Get('me')
  @Roles(UserRole.Employee, UserRole.Secretary, UserRole.Manager)
  public async getMyReservations(@Req() req: CustomizedExpressRequest) {
    const userId = req.user.id;
    const reservations = await this.getUserReservationsUseCase.execute(userId);
    return reservations.map((r) => this.mapToFrontendDto(r));
  }

  @Get('user/:userId')
  @Roles(UserRole.Manager, UserRole.Secretary)
  public async getUserReservations(@Param('userId') userId: string) {
    const reservations = await this.getUserReservationsUseCase.execute(userId);
    return reservations.map((r) => this.mapToFrontendDto(r));
  }

  @Get('month')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async getReservationsForMonth(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    if (!year || !month) {
      throw new HttpException(
        'Missing required query parameters: year, month',
        HttpStatus.BAD_REQUEST,
      );
    }
    const reservations = await this.getReservationsForMonthUseCase.execute(
      parseInt(year, 10),
      parseInt(month, 10),
    );
    return reservations.map((r) => this.mapToFrontendDto(r));
  }

  @Get('history')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async getReservationHistory(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('period') period?: ReservationSlot,
  ) {
    if (!start || !end) {
      throw new HttpException(
        'Missing required query parameters: start, end',
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = new GetReservationHistoryQuery(
      new Date(start),
      new Date(end),
      period,
    );

    return this.getReservationHistoryUseCase.execute(query);
  }

  @Delete(':id')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async cancelReservation(
    @Req() req: CustomizedExpressRequest,
    @Param('id') id: string,
  ) {
    const userId = req.user.id;
    const res = await this.cancelReservationUseCase.execute(userId, id);
    return this.mapToFrontendDto(res);
  }

  @Post(':id/check-in')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async checkIn(
    @Req() req: CustomizedExpressRequest,
    @Param('id') reservationId: string,
  ) {
    const userId = req.user.id;
    return this.checkInUseCase.execute(userId, reservationId);
  }

  @Post('check-in/qr/:spotId')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async checkInByQr(
    @Req() req: CustomizedExpressRequest,
    @Param('spotId') spotId: string,
  ) {
    const userId = req.user.id;
    return this.checkInByQrUseCase.execute({
      userId,
      spotId,
      now: new Date(),
      source: 'qr',
    });
  }

  @Patch(':id')
  @Roles(UserRole.Manager, UserRole.Secretary)
  public async updateReservation(
    @Req() req: CustomizedExpressRequest,
    @Param('id') reservationId: string,
    @Body() dto: UpdateReservationRequestDto,
  ) {
    const actorId = req.user.id;
    const updated = await this.updateReservationUseCase.execute({
      actorId,
      reservationId,
      spotId: dto.spotId,
      date: dto.date ? new Date(dto.date) : undefined,
      slot: dto.slot,
      needsCharging: dto.needsCharging,
    });
    return this.mapToFrontendDto(updated);
  }
}
