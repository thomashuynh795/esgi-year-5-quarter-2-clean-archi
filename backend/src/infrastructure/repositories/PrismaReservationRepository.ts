import { PrismaClient, Reservation as PrismaReservation } from '@prisma/client';
import { Reservation, ReservationStatus } from '../../domain/entities/Reservation';
import { ReservationRepository } from '../../domain/repositories/ReservationRepository';

export class PrismaReservationRepository implements ReservationRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(userId: number, slotId: number, date: Date): Promise<Reservation> {
        const prismaReservation = await this.prisma.reservation.create({
            data: {
                userId,
                slotId,
                date,
                status: 'CONFIRMED'
            },
            include: { slot: true }
        });
        return this.mapToEntity(prismaReservation);
    }

    async findByUser(userId: number): Promise<Reservation[]> {
        const prismaReservations = await this.prisma.reservation.findMany({
            where: { userId },
            include: { slot: true },
            orderBy: { date: 'asc' }
        });
        return prismaReservations.map(r => this.mapToEntity(r));
    }

    async findByDate(date: Date): Promise<Reservation[]> {
        const prismaReservations = await this.prisma.reservation.findMany({
            where: {
                date: date,
                status: { not: 'CANCELLED' } // Only return active reservations
            },
            include: { slot: true }
        });
        return prismaReservations.map(r => this.mapToEntity(r));
    }

    async findByDateAndSlot(date: Date, slotId: number): Promise<Reservation | null> {
        const prismaReservation = await this.prisma.reservation.findFirst({
            where: {
                date,
                slotId,
                status: { not: 'CANCELLED' }
            }
        });
        return prismaReservation ? this.mapToEntity(prismaReservation) : null;
    }

    async countUserReservationsForWeek(userId: number, date: Date): Promise<number> {
        // Simplistic check: Future reservations
        const count = await this.prisma.reservation.count({
            where: {
                userId,
                date: {
                    gte: new Date()
                },
                status: { not: 'CANCELLED' }
            }
        });
        return count;
    }

    async updateStatus(id: number, status: string): Promise<Reservation> {
        const prismaReservation = await this.prisma.reservation.update({
            where: { id },
            data: { status },
            include: { slot: true }
        });
        return this.mapToEntity(prismaReservation);
    }


    private mapToEntity(prismaReservation: any): Reservation {
        return new Reservation(
            prismaReservation.id,
            prismaReservation.date,
            prismaReservation.status as ReservationStatus,
            prismaReservation.userId,
            prismaReservation.slotId,
            // Pass the included slot if present
            undefined, // User not included usually
            prismaReservation.slot ? {
                id: prismaReservation.slot.id,
                name: prismaReservation.slot.name,
                row: prismaReservation.slot.row,
                number: prismaReservation.slot.number,
                type: prismaReservation.slot.type
            } : undefined
        );
    }
}
