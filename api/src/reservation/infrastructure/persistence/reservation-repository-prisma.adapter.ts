import { Injectable } from '@nestjs/common';
import { ReservationRepository } from '../../domain/reservation.repository';
import type { ReservationSlot } from '../../domain/enums/reservation-slot.enum';
import { CheckInEntity } from '../../domain/check-in.entity';
import { PrismaService } from '../../../database/infrastructure/prisma/prisma.service';
import { ParkingSpotId } from '../../domain/classes/parking-spot-id.class';
import { PrismaReservationMapper } from './mappers/prisma-reservation.mapper';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { Reservation } from '../../domain/classes/reservation.class';

@Injectable()
export class ReservationRepositoryPrismaAdapter implements ReservationRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async save(reservation: Reservation): Promise<Reservation> {
    const data = PrismaReservationMapper.toPrismaCreate(reservation);

    const saved = await this.prisma.reservation.upsert({
      where: { id: data.id },
      update: {
        status: data.status,
        needsCharger: data.needsCharger,
        slot: data.slot,
        date: data.date,
        spotId: data.spotId,
        userId: data.userId,
        cancelledAt: data.cancelledAt,
        releasedAt: data.releasedAt,
      },
      create: {
        id: data.id,
        userId: data.userId,
        spotId: data.spotId,
        date: data.date,
        slot: data.slot,
        status: data.status,
        needsCharger: data.needsCharger,
        cancelledAt: data.cancelledAt,
        releasedAt: data.releasedAt,
      },
    });

    return PrismaReservationMapper.toDomain(saved);
  }

  public async findById(reservationId: string): Promise<Reservation | null> {
    const res = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });
    return res ? PrismaReservationMapper.toDomain(res) : null;
  }

  public async findByUser(userId: string): Promise<Reservation[]> {
    const res = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return res.map((res) => PrismaReservationMapper.toDomain(res));
  }

  public async findBySpot(
    spotId: ParkingSpotId,
    date: Date,
  ): Promise<Reservation[]> {
    const todayStart = new Date(date);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(date);
    todayEnd.setHours(23, 59, 59, 999);

    const res = await this.prisma.reservation.findMany({
      where: {
        spotId: spotId.value,
        date: { gte: todayStart, lte: todayEnd },
        status: { in: [ReservationStatus.Booked, ReservationStatus.CheckedIn] },
      },
    });

    return res.map((res) => PrismaReservationMapper.toDomain(res));
  }

  public async findConflicting(
    userId: string,
    date: Date,
    slot: ReservationSlot,
  ): Promise<Reservation | null> {
    const todayStart = new Date(date);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(date);
    todayEnd.setHours(23, 59, 59, 999);

    const res = await this.prisma.reservation.findFirst({
      where: {
        userId,
        date: { gte: todayStart, lte: todayEnd },
        slot: slot,
        status: { in: [ReservationStatus.Booked, ReservationStatus.CheckedIn] },
      },
    });

    return res ? PrismaReservationMapper.toDomain(res) : null;
  }

  public async findConflictingSpot(
    spotId: ParkingSpotId,
    date: Date,
    slot: ReservationSlot,
  ): Promise<Reservation | null> {
    const todayStart = new Date(date);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(date);
    todayEnd.setHours(23, 59, 59, 999);

    const res = await this.prisma.reservation.findFirst({
      where: {
        spotId: spotId.value,
        date: { gte: todayStart, lte: todayEnd },
        slot: slot,
        status: { in: [ReservationStatus.Booked, ReservationStatus.CheckedIn] },
      },
    });

    return res ? PrismaReservationMapper.toDomain(res) : null;
  }

  public async saveCheckIn(checkIn: CheckInEntity): Promise<CheckInEntity> {
    const saved = await this.prisma.checkIn.upsert({
      where: { reservationId: checkIn.reservationId },
      update: {},
      create: {
        reservationId: checkIn.reservationId,
        userId: checkIn.userId,
        spotId: checkIn.spotId.value,
        source: checkIn.source,
      },
    });

    return PrismaReservationMapper.checkInToDomain(saved);
  }

  public async findUnconfirmedBookings(
    date: Date,
    slot?: ReservationSlot,
  ): Promise<Reservation[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(date);
    targetDateEnd.setHours(23, 59, 59, 999);

    const whereClause = {
      date: { gte: targetDate, lte: targetDateEnd },
      status: ReservationStatus.Booked,
      ...(slot ? { slot } : {}),
    };

    if (slot) {
      whereClause.slot = slot;
    }

    const res = await this.prisma.reservation.findMany({ where: whereClause });
    return res.map((res) => PrismaReservationMapper.toDomain(res));
  }

  async findReservationsByDatesAndSlot(
    dates: Date[],
    slot: ReservationSlot,
  ): Promise<Reservation[]> {
    if (dates.length === 0) return [];

    const dateConditions = dates.map((d) => {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      return { date: { gte: start, lte: end } };
    });

    const res = await this.prisma.reservation.findMany({
      where: {
        OR: dateConditions,
        slot: slot,
        status: {
          in: [ReservationStatus.Booked, ReservationStatus.CheckedIn],
        },
      },
    });

    return res.map((res) => PrismaReservationMapper.toDomain(res));
  }

  public async findByDate(date: Date): Promise<Reservation[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const res = await this.prisma.reservation.findMany({
      where: {
        date: { gte: dayStart, lte: dayEnd },
        status: {
          in: [
            ReservationStatus.Booked,
            ReservationStatus.CheckedIn,
            ReservationStatus.NoShow,
            ReservationStatus.Released,
          ],
        },
      },
    });

    return res.map((r) => PrismaReservationMapper.toDomain(r));
  }

  public async findByDateRange(params: {
    start: Date;
    end: Date;
    statuses?: ReservationStatus[];
  }): Promise<Reservation[]> {
    const start = new Date(params.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(params.end);
    end.setHours(23, 59, 59, 999);

    const res = await this.prisma.reservation.findMany({
      where: {
        date: { gte: start, lte: end },
        status: params.statuses ? { in: params.statuses } : undefined,
      },
      orderBy: [{ date: 'asc' }, { slot: 'asc' }],
    });

    return res.map((r) => PrismaReservationMapper.toDomain(r));
  }

  public async countDistinctActiveDatesFrom(params: {
    userId: string;
    from: Date;
    statuses?: ReservationStatus[];
  }): Promise<number> {
    const from = new Date(params.from);
    from.setHours(0, 0, 0, 0);

    const statuses = params.statuses ?? [
      ReservationStatus.Booked,
      ReservationStatus.CheckedIn,
    ];

    const rows = await this.prisma.reservation.findMany({
      select: { date: true },
      where: {
        userId: params.userId,
        date: { gte: from },
        status: { in: statuses },
      },
      distinct: ['date'],
    });

    return rows.length;
  }

  public async findByUserSpotDateSlot(params: {
    userId: string;
    spotId: ParkingSpotId;
    date: Date;
    slot: ReservationSlot;
  }): Promise<Reservation | null> {
    const dayStart = new Date(params.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(params.date);
    dayEnd.setHours(23, 59, 59, 999);

    const res = await this.prisma.reservation.findFirst({
      where: {
        userId: params.userId,
        spotId: params.spotId.value,
        slot: params.slot,
        date: { gte: dayStart, lte: dayEnd },
        status: { in: [ReservationStatus.Booked] },
      },
    });

    return res ? PrismaReservationMapper.toDomain(res) : null;
  }

  async findReservationsForMonth(
    year: number,
    month: number,
  ): Promise<Reservation[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const res = await this.prisma.reservation.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: { in: [ReservationStatus.Booked, ReservationStatus.CheckedIn] },
      },
    });

    return res.map((res) => PrismaReservationMapper.toDomain(res));
  }

  public async existsConflict(params: {
    spotId: ParkingSpotId;
    date: Date;
    slot: ReservationSlot;
  }): Promise<boolean> {
    const dayStart = new Date(params.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(params.date);
    dayEnd.setHours(23, 59, 59, 999);

    const conflict = await this.prisma.reservation.findFirst({
      select: { id: true },
      where: {
        spotId: params.spotId.value,
        date: { gte: dayStart, lte: dayEnd },
        slot: params.slot,
        status: { in: [ReservationStatus.Booked, ReservationStatus.CheckedIn] },
      },
    });

    return conflict !== null;
  }
}
