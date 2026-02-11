
import { Injectable } from '@nestjs/common';
import { Reservation, ReservationStatus } from '../domain/Reservation';
import { ReservationRepository } from '../domain/ReservationRepository';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class PrismaReservationRepository implements ReservationRepository {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, slotId: number, date: Date, period: 'AM' | 'PM' = 'AM'): Promise<Reservation> {
        const prismaReservation = await this.prisma.reservation.upsert({
            where: {
                date_slotId_period: {
                    date,
                    slotId,
                    period,
                },
            },
            update: {
                userId,
                status: 'CONFIRMED',
                createdAt: new Date(),
            },
            create: {
                userId,
                slotId,
                date,
                period,
                status: 'CONFIRMED',
            },
            include: { slot: true },
        });
        return this.mapToEntity(prismaReservation);
    }

    async findByUser(userId: number): Promise<Reservation[]> {
        const prismaReservations = await this.prisma.reservation.findMany({
            where: {
                userId,
                status: { not: 'CANCELLED' },
            },
            include: { slot: true },
            orderBy: { date: 'asc' },
        });
        return prismaReservations.map(r => this.mapToEntity(r));
    }

    async findByDate(date: Date): Promise<Reservation[]> {
        const prismaReservations = await this.prisma.reservation.findMany({
            where: {
                date: date,
                status: { not: 'CANCELLED' },
            },
            include: { slot: true },
        });
        return prismaReservations.map(r => this.mapToEntity(r));
    }

    async findByDateAndSlot(date: Date, slotId: number, period?: 'AM' | 'PM'): Promise<Reservation | null> {
        const where: any = {
            date,
            slotId,
            status: { not: 'CANCELLED' },
        };
        if (period) {
            where.period = period;
        }

        const prismaReservation = await this.prisma.reservation.findFirst({
            where,
            include: { slot: true },
        });
        return prismaReservation ? this.mapToEntity(prismaReservation) : null;
    }

    async countUserReservationsForWeek(userId: number, date: Date): Promise<number> {
        const count = await this.prisma.reservation.count({
            where: {
                userId,
                date: {
                    gte: new Date(),
                },
                status: { not: 'CANCELLED' },
            },
        });
        return count;
    }

    async updateStatus(id: number, status: string): Promise<Reservation> {
        const prismaReservation = await this.prisma.reservation.update({
            where: { id },
            data: { status },
            include: { slot: true },
        });
        return this.mapToEntity(prismaReservation);
    }

    async findForDates(dates: Date[]): Promise<Reservation[]> {
        const prismaReservations = await this.prisma.reservation.findMany({
            where: {
                date: { in: dates },
                status: { not: 'CANCELLED' },
            },
            include: { slot: true },
        });
        return prismaReservations.map(r => this.mapToEntity(r));
    }

    async findById(id: number): Promise<Reservation | null> {
        const prismaReservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { slot: true },
        });

        if (!prismaReservation) return null;
        return this.mapToEntity(prismaReservation);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.reservation.delete({
            where: { id },
        });
    }

    private mapToEntity(prismaReservation: any): Reservation {
        return new Reservation(
            prismaReservation.id,
            prismaReservation.date,
            prismaReservation.status as ReservationStatus,
            prismaReservation.userId,
            prismaReservation.slotId,
            prismaReservation.period as 'AM' | 'PM',
            prismaReservation.createdAt,
            undefined,
            prismaReservation.slot ? {
                id: prismaReservation.slot.id,
                name: prismaReservation.slot.name,
                row: prismaReservation.slot.row,
                number: prismaReservation.slot.number,
                type: prismaReservation.slot.type,
            } : undefined,
        );
    }
}
