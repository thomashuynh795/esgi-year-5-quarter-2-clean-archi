import 'dotenv/config';
import {
  PrismaClient,
  ReservationSlot,
  ReservationStatus,
  UserRole,
  VehicleType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Argon2PasswordAdapter } from '../../../auth/infrastructure/adapters/argon2-password.adapter';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is missing. Add it to your .env file at the project root.',
  );
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });
const passwordPort = new Argon2PasswordAdapter();

function spotCode(row: string, num: number): string {
  return `${row}${String(num).padStart(2, '0')}`;
}

function dateAtMidnightUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function addDays(base: Date, days: number): Date {
  return dateAtMidnightUTC(new Date(base.getTime() + days * 24 * 3600 * 1000));
}

async function upsertUser(userToCreate: {
  email: string;
  roles: UserRole[];
  firstName: string;
  lastName: string;
  vehicleType: VehicleType;
  password: string;
}) {
  return await prisma.user.upsert({
    where: { email: userToCreate.email },
    update: {
      roles: userToCreate.roles,
      firstName: userToCreate.firstName,
      lastName: userToCreate.lastName,
      vehicleType: userToCreate.vehicleType,
      isActive: true,
      passwordHash: await passwordPort.hashPassword(userToCreate.password),
    },
    create: {
      email: userToCreate.email,
      roles: userToCreate.roles,
      firstName: userToCreate.firstName,
      lastName: userToCreate.lastName,
      vehicleType: userToCreate.vehicleType,
      isActive: true,
      passwordHash: await passwordPort.hashPassword(userToCreate.password),
    },
  });
}

async function createReservation(params: {
  userId: string;
  spotId: string;
  date: Date;
  slot: ReservationSlot;
  needsCharger: boolean;
  status?: ReservationStatus;
  checkIn?: boolean;
}) {
  const reservation = await prisma.reservation.create({
    data: {
      userId: params.userId,
      spotId: params.spotId,
      date: dateAtMidnightUTC(params.date),
      slot: params.slot,
      needsCharger: params.needsCharger,
      status: params.status ?? ReservationStatus.BOOKED,
    },
  });

  await prisma.reservationEvent.create({
    data: {
      reservationId: reservation.id,
      type: 'BOOKED',
      payload: {
        spotId: params.spotId,
        date: reservation.date.toISOString(),
        slot: params.slot,
        needsCharger: params.needsCharger,
      },
      actorId: params.userId,
    },
  });

  if (params.checkIn) {
    await prisma.checkIn.create({
      data: {
        reservationId: reservation.id,
        userId: params.userId,
        spotId: params.spotId,
        source: 'APP_BUTTON',
      },
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: ReservationStatus.CHECKED_IN },
    });

    await prisma.reservationEvent.create({
      data: {
        reservationId: reservation.id,
        type: 'CHECKED_IN',
        payload: { source: 'APP_BUTTON' },
        actorId: params.userId,
      },
    });
  }

  if (
    (params.status ?? ReservationStatus.BOOKED) === ReservationStatus.RELEASED
  ) {
    await prisma.reservationEvent.create({
      data: {
        reservationId: reservation.id,
        type: 'RELEASED',
        payload: { reason: 'NO_CHECKIN_BEFORE_11' },
        actorId: null,
      },
    });
  }

  return reservation;
}

async function main() {
  await prisma.checkIn.deleteMany({});
  await prisma.reservationEvent.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.auditEvent.deleteMany({});

  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (const row of rows) {
    for (let n = 1; n <= 10; n++) {
      const id = spotCode(row, n);
      await prisma.parkingSpot.upsert({
        where: { id },
        update: {
          row,
          number: n,
          hasCharger: row === 'A' || row === 'F',
          isActive: true,
        },
        create: {
          id,
          row,
          number: n,
          hasCharger: row === 'A' || row === 'F',
          isActive: true,
        },
      });
    }
  }

  const secretary1 = await upsertUser({
    email: 'secretary1@mail.net',
    roles: [UserRole.SECRETARY],
    firstName: 'Sarah',
    lastName: 'Secretary',
    vehicleType: VehicleType.NONE,
    password: 'password',
  });

  await upsertUser({
    email: 'secretary2@mail.net',
    roles: [UserRole.SECRETARY],
    firstName: 'John',
    lastName: 'Secretary',
    vehicleType: VehicleType.NONE,
    password: 'password',
  });

  const manager1 = await upsertUser({
    email: 'manager1@mail.net',
    roles: [UserRole.MANAGER],
    firstName: 'Marc',
    lastName: 'Manager',
    vehicleType: VehicleType.HYBRID,
    password: 'password',
  });

  const manager2 = await upsertUser({
    email: 'manager2@mail.net',
    roles: [UserRole.MANAGER, UserRole.SECRETARY],
    firstName: 'Alice',
    lastName: 'Manager',
    vehicleType: VehicleType.HYBRID,
    password: 'password',
  });

  const employee1 = await upsertUser({
    email: 'employee1@mail.net',
    roles: [UserRole.EMPLOYEE],
    firstName: 'Emma',
    lastName: 'Employee',
    vehicleType: VehicleType.THERMAL,
    password: 'password',
  });

  const employee2 = await upsertUser({
    email: 'employee2@mail.net',
    roles: [UserRole.EMPLOYEE],
    firstName: 'Ethan',
    lastName: 'Employee',
    vehicleType: VehicleType.ELECTRIC,
    password: 'password',
  });

  const employee3 = await upsertUser({
    email: 'employee3@mail.net',
    roles: [UserRole.EMPLOYEE],
    firstName: 'Elise',
    lastName: 'Employee',
    vehicleType: VehicleType.HYBRID,
    password: 'password',
  });

  const now = new Date();
  const d0 = dateAtMidnightUTC(now);
  const d1 = dateAtMidnightUTC(new Date(now.getTime() + 24 * 3600 * 1000));
  const d2 = dateAtMidnightUTC(new Date(now.getTime() + 2 * 24 * 3600 * 1000));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const d3 = dateAtMidnightUTC(new Date(now.getTime() + 3 * 24 * 3600 * 1000));

  await createReservation({
    userId: employee1.id,
    spotId: 'B03',
    date: d0,
    slot: ReservationSlot.AM,
    needsCharger: false,
    checkIn: true,
  });

  await createReservation({
    userId: employee1.id,
    spotId: 'C04',
    date: d1,
    slot: ReservationSlot.PM,
    needsCharger: false,
  });

  await createReservation({
    userId: employee2.id,
    spotId: 'A01',
    date: d0,
    slot: ReservationSlot.PM,
    needsCharger: true,
    checkIn: true,
  });

  await createReservation({
    userId: employee2.id,
    spotId: 'F10',
    date: d1,
    slot: ReservationSlot.AM,
    needsCharger: true,
    status: ReservationStatus.RELEASED,
  });

  await createReservation({
    userId: employee3.id,
    spotId: 'F02',
    date: d2,
    slot: ReservationSlot.AM,
    needsCharger: true,
  });

  for (let i = 1; i <= 30; i++) {
    const pastDate = addDays(d0, -i);

    const e1Checked = i % 2 === 0;
    await createReservation({
      userId: employee1.id,
      spotId: 'C02',
      date: pastDate,
      slot: ReservationSlot.AM,
      needsCharger: false,
      status: e1Checked
        ? ReservationStatus.CHECKED_IN
        : ReservationStatus.BOOKED,
      checkIn: e1Checked,
    });

    const released = i % 5 === 0;
    await createReservation({
      userId: employee2.id,
      spotId: 'A02',
      date: pastDate,
      slot: ReservationSlot.PM,
      needsCharger: true,
      status: released ? ReservationStatus.RELEASED : ReservationStatus.BOOKED,
      checkIn: !released && i % 3 === 0,
    });
  }

  for (let i = 1; i <= 10; i++) {
    const date = addDays(d0, -i);
    const checked = i % 3 === 0;

    await createReservation({
      userId: manager1.id,
      spotId: 'D06',
      date,
      slot: ReservationSlot.AM,
      needsCharger: false,
      status: checked ? ReservationStatus.CHECKED_IN : ReservationStatus.BOOKED,
      checkIn: checked,
    });
  }

  const LONG_DAYS = 90;
  const managerSpotAssignments: Array<{
    userId: string;
    spotId: string;
    needsCharger: boolean;
  }> = [
    { userId: manager1.id, spotId: 'D07', needsCharger: false },
    { userId: manager2.id, spotId: 'E08', needsCharger: false },
  ];

  for (const m of managerSpotAssignments) {
    for (let i = 0; i < LONG_DAYS; i++) {
      const date = addDays(d0, i);

      await createReservation({
        userId: m.userId,
        spotId: m.spotId,
        date,
        slot: ReservationSlot.AM,
        needsCharger: m.needsCharger,
        status:
          i % 12 === 0
            ? ReservationStatus.RELEASED
            : i % 4 === 0
              ? ReservationStatus.CHECKED_IN
              : ReservationStatus.BOOKED,
        checkIn: i % 4 === 0,
      });

      await createReservation({
        userId: m.userId,
        spotId: m.spotId,
        date,
        slot: ReservationSlot.PM,
        needsCharger: m.needsCharger,
        status:
          i % 10 === 0
            ? ReservationStatus.RELEASED
            : i % 3 === 0
              ? ReservationStatus.CHECKED_IN
              : ReservationStatus.BOOKED,
        checkIn: i % 3 === 0,
      });
    }
  }

  await prisma.auditEvent.create({
    data: {
      action: 'SEED_COMPLETED',
      entity: 'DATABASE',
      entityId: 'seed',
      payload: {
        users: [
          secretary1.email,
          manager1.email,
          manager2.email,
          employee1.email,
          employee2.email,
          employee3.email,
        ],
      },
      actorId: secretary1.id,
    },
  });

  console.log('Seed done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
