
import { PrismaClient, SlotType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Seed Users
    const password = await bcrypt.hash('password123', 10);

    const users = [
        { email: 'employee@test.com', role: UserRole.EMPLOYEE, password },
        { email: 'secretary@test.com', role: UserRole.SECRETARY, password },
        { email: 'manager@test.com', role: UserRole.MANAGER, password },
    ];

    for (const u of users) {
        const exists = await prisma.user.findUnique({ where: { email: u.email } });
        if (!exists) {
            await prisma.user.create({ data: u });
            console.log(`Created user: ${u.email}`);
        }
    }

    // 2. Seed Parking Slots
    // 60 places: Rows A-F, 10 places each
    // A and F are ELECTRIC
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (const row of rows) {
        const isElectric = row === 'A' || row === 'F';
        const type = isElectric ? SlotType.ELECTRIC : SlotType.STANDARD;

        for (let i = 1; i <= 10; i++) {
            const name = `${row}${i.toString().padStart(2, '0')}`;

            const exists = await prisma.parkingSlot.findUnique({ where: { name } });
            if (!exists) {
                await prisma.parkingSlot.create({
                    data: {
                        name,
                        row,
                        number: i,
                        type
                    }
                });
                console.log(`Created slot: ${name}`);
            }
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
