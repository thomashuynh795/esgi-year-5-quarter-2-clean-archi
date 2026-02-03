import { PrismaClient, ParkingSlot as PrismaSlot } from '@prisma/client';
import { ParkingSlot, SlotType } from '../../domain/entities/ParkingSlot';
import { ParkingSlotRepository } from '../../domain/repositories/ParkingSlotRepository';

export class PrismaParkingSlotRepository implements ParkingSlotRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findAll(): Promise<ParkingSlot[]> {
        const prismaSlots = await this.prisma.parkingSlot.findMany({
            orderBy: [
                { row: 'asc' },
                { number: 'asc' }
            ]
        });
        return prismaSlots.map(this.mapToEntity);
    }

    async findById(id: number): Promise<ParkingSlot | null> {
        const prismaSlot = await this.prisma.parkingSlot.findUnique({ where: { id } });
        return prismaSlot ? this.mapToEntity(prismaSlot) : null;
    }

    private mapToEntity(prismaSlot: PrismaSlot): ParkingSlot {
        return new ParkingSlot(
            prismaSlot.id,
            prismaSlot.name,
            prismaSlot.row,
            prismaSlot.number,
            prismaSlot.type as SlotType
        );
    }
}
