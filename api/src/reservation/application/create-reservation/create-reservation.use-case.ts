import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { ForbiddenException } from '../../../shared/error/domain/forbidden.exception';
import { ParkingSpotRepository } from '../../../parking/domain/parking-spot.repository';
import { IdGenerator } from '../../../shared/id/domain/id-generator';
import { UserRole } from '../../../user/domain/enums/user-role.enum';
import { UserRepository } from '../../../user/domain/user.repository';
import { Reservation } from '../../domain/classes/reservation.class';
import { CreateReservationCommand } from './create-reservation.command';
import { CreateReservationResult } from './create-reservation.result';
import { ReservationRepository } from '../../domain/reservation.repository';
import { VehicleType } from '../../../user/domain/enums/vehicle-type.enum';
import type { OutboxPort } from '../ports/outbox.port';
import type { ReservationEventPort } from '../ports/reservation-event.port';

export class CreateReservationUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly parkingSpotRepository: ParkingSpotRepository,
    private readonly userRepository: UserRepository,
    private readonly idGenerator: IdGenerator,
    private readonly outbox: OutboxPort,
    private readonly reservationEvents: ReservationEventPort,
  ) {}

  public async execute(
    command: CreateReservationCommand,
  ): Promise<CreateReservationResult> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const spot = await this.parkingSpotRepository.findById(command.spotId);
    if (!spot) {
      throw new NotFoundException('Parking spot not found.');
    }

    const isElectricRow = spot.row === 'A' || spot.row === 'F';

    if (command.needsCharging && !isElectricRow) {
      throw new BadRequestException(
        'Charging requested but only rows A or F can be selected.',
      );
    }

    if (command.needsCharging && !spot.hasCharger) {
      throw new BadRequestException(
        'Charging requested but spot has no charger.',
      );
    }

    if (isElectricRow) {
      const isAllowedVehicle =
        user.vehicleType === VehicleType.Electric ||
        user.vehicleType === VehicleType.Hybrid;

      if (!isAllowedVehicle) {
        throw new ForbiddenException(
          'Only electric or hybrid vehicles can reserve rows A or F.',
        );
      }
    }

    const today = new Date();
    const startAtMidnight = this.toMidnight(command.startDate);

    const todayMidnight = this.toMidnight(today);
    if (startAtMidnight < todayMidnight) {
      throw new BadRequestException('Reservation cannot start in the past.');
    }

    const dayOfWeek = startAtMidnight.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
      throw new BadRequestException(
        'Reservations are not allowed on Saturday or Sunday.',
      );
    }

    const dates = this.expandDatesFromDuration(
      command.startDate,
      command.duration,
    );

    this.assertDurationAllowed(dates, user.roles);

    if (!user.roles.includes(UserRole.Manager)) {
      const alreadyReservedDays =
        await this.reservationRepository.countDistinctActiveDatesFrom({
          userId: user.id,
          from: today,
        });

      const requestedWorkingDays = dates.length;
      if (alreadyReservedDays + requestedWorkingDays > 5) {
        throw new ForbiddenException(
          'Employees can reserve up to 5 working days in total (upcoming).',
        );
      }
    }

    const createdIds: string[] = [];

    for (const date of dates) {
      const conflict = await this.reservationRepository.existsConflict({
        spotId: command.spotId,
        date,
        slot: command.slot,
      });

      if (conflict) {
        throw new BadRequestException('Spot already reserved.');
      }

      const reservationId = this.idGenerator.generate();
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      const reservation = Reservation.book({
        id: reservationId,
        userId: user.id,
        spotId: command.spotId,
        date,
        slot: command.slot,
        needsCharging: command.needsCharging,
        now: d,
      });

      await this.reservationRepository.save(reservation);
      createdIds.push(reservationId);

      await this.reservationEvents.append({
        reservationId,
        type: 'reservation.created',
        actorId: user.id,
        payload: {
          userId: user.id,
          spotId: command.spotId.value,
          date: date.toISOString().slice(0, 10),
          slot: command.slot,
          needsCharging: command.needsCharging,
        },
      });

      await this.outbox.add({
        type: 'reservation.created',
        payload: {
          reservationId,
          userId: user.id,
          spotId: command.spotId.value,
          date: date.toISOString().slice(0, 10),
          slot: command.slot,
        },
      });
    }

    return new CreateReservationResult(createdIds);
  }

  private assertDurationAllowed(dates: Date[], roles: string[]): void {
    if (roles.includes(UserRole.Manager)) {
      if (dates.length > 30) {
        throw new BadRequestException(
          'Managers cannot reserve more than 30 days.',
        );
      }
      return;
    }

    if (dates.length > 5) {
      throw new BadRequestException(
        'Employees cannot reserve more than 5 working days.',
      );
    }
  }

  private expandDatesFromDuration(start: Date, duration: number): Date[] {
    const dates: Date[] = [];
    const cursor = this.toMidnight(start);

    while (dates.length < duration) {
      const day = cursor.getDay();
      const isWeekend = day === 0 || day === 6;

      if (!isWeekend) {
        dates.push(new Date(cursor));
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
  }

  private toMidnight(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
