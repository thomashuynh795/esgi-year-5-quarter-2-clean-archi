import { PrismaClient } from '@prisma/client';
import { GetAvailableSlots } from '../src/application/use-cases/GetAvailableSlots';
import { PrismaParkingSlotRepository } from '../src/infrastructure/repositories/PrismaParkingSlotRepository';
import { PrismaReservationRepository } from '../src/infrastructure/repositories/PrismaReservationRepository';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting reproduction script...");

    // 1. Setup User
    let user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found, creating test user...");
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                role: 'EMPLOYEE'
            }
        });
    }
    const userId = user.id;

    // 2. Setup Data
    const testDate = new Date("2024-05-20"); // Monday
    const period = 'AM';

    // Find a slot
    const slot = await prisma.parkingSlot.findFirst();
    if (!slot) {
        console.error("No parking slots found!");
        return;
    }
    console.log(`Testing with Slot ID: ${slot.id}, Name: ${slot.name}`);

    // Cleanup existing reservations for this slot/date
    await prisma.reservation.deleteMany({
        where: {
            slotId: slot.id,
            date: testDate,
            period: period
        }
    });

    // Create a CONFIRMED reservation
    // We assume the DB stores it as midnight UTC if we pass new Date("2024-05-20")
    console.log(`Creating reservation for ${testDate.toISOString().split('T')[0]} ${period}`);
    await prisma.reservation.create({
        data: {
            date: testDate,
            period: period,
            status: 'CONFIRMED',
            userId: userId,
            slotId: slot.id
        }
    });

    // 3. Test GetAvailableSlots
    const slotRepo = new PrismaParkingSlotRepository();
    const resRepo = new PrismaReservationRepository();
    const useCase = new GetAvailableSlots(slotRepo, resRepo);

    // Get slots for that date
    console.log("Fetching available slots via UseCase...");
    const slots = await useCase.execute(testDate, period, 1);

    const targetSlot = slots.find(s => s.id === slot.id);
    if (!targetSlot) {
        console.error("Target slot not found in result!");
        return;
    }

    console.log(`Slot ${slot.id} isReserved: ${targetSlot.isReserved}`);

    if (targetSlot.isReserved) {
        console.log("SUCCESS: Slot is correctly marked as reserved.");
    } else {
        console.error("FAILURE: Slot should be reserved but is not.");
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
