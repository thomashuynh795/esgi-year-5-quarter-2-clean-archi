import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 1. Create Parking Slots (6 Rows * 10 Spots)
    // Row A (Electric)
    // Row B, C, D, E (Standard)
    // Row F (Electric)

    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (const row of rows) {
        const type = (row === 'A' || row === 'F') ? 'ELECTRIC' : 'STANDARD';

        for (let i = 1; i <= 10; i++) {
            const number = i;
            const name = `${row}${number.toString().padStart(2, '0')}`; // A01, A02...

            await prisma.parkingSlot.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                    row,
                    number,
                    type
                }
            });
        }
    }

    // 2. Create Users
    await prisma.user.upsert({
        where: { email: 'john@employee.com' },
        update: {},
        create: {
            email: 'john@employee.com',
            role: 'EMPLOYEE'
        }
    });

    await prisma.user.upsert({
        where: { email: 'jane@manager.com' },
        update: {},
        create: {
            email: 'jane@manager.com',
            role: 'MANAGER'
        }
    });

    await prisma.user.upsert({
        where: { email: 'admin@secretary.com' },
        update: {},
        create: {
            email: 'admin@secretary.com',
            role: 'SECRETARY'
        }
    });

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
