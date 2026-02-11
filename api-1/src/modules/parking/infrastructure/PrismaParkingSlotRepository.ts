
import { Injectable } from '@nestjs/common';
import { ParkingSlot, SlotType } from '../domain/ParkingSlot';
import { ParkingSlotRepository } from '../domain/ParkingSlotRepository';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class PrismaParkingSlotRepository implements ParkingSlotRepository {
    constructor(private prisma: PrismaService) { }

    async findAll(): Promise<ParkingSlot[]> {
        const slots = await this.prisma.parkingSlot.findMany({
            orderBy: [{ row: 'asc' }, { number: 'asc' }],
        });
        return slots.map(this.mapToEntity);
    }

    async findById(id: number): Promise<ParkingSlot | null> {
        const slot = await this.prisma.parkingSlot.findUnique({ where: { id } });
        return slot ? this.mapToEntity(slot) : null;
    }

    async save(slot: ParkingSlot): Promise<ParkingSlot> {

        const savedSlot = await this.prisma.parkingSlot.create({
            data: {
                name: slot.name,
                row: slot.row,
                number: slot.number,
                type: slot.type,
            },
        });
        return this.mapToEntity(savedSlot);
    }

    private mapToEntity(prismaSlot: any): ParkingSlot {
        return new ParkingSlot(
            prismaSlot.id,
            prismaSlot.name,
            prismaSlot.row,
            prismaSlot.number,
            prismaSlot.type as SlotType,
        );
    }
}
