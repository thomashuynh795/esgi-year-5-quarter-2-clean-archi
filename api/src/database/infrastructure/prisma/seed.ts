import 'dotenv/config';
import {
  PrismaClient,
  ReservationSlot,
  ReservationStatus,
  UserRole,
  VehicleType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import crypto from 'crypto';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is missing. Add it to your .env file at the project root.',
  );
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

function hashPasswordForSeed(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

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

async function upsertUser(params: {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  vehicleType: VehicleType;
  password: string;
}) {
  return await prisma.user.upsert({
    where: { email: params.email },
    update: {
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      vehicleType: params.vehicleType,
      isActive: true,
      passwordHash: hashPasswordForSeed(params.password),
    },
    create: {
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      vehicleType: params.vehicleType,
      isActive: true,
      passwordHash: hashPasswordForSeed(params.password),
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

  const secretary = await upsertUser({
    email: 'secretary@corp.local',
    role: UserRole.SECRETARY,
    firstName: 'Sarah',
    lastName: 'Secretary',
    vehicleType: VehicleType.NONE,
    password: 'secretary',
  });

  const manager = await upsertUser({
    email: 'manager@corp.local',
    role: UserRole.MANAGER,
    firstName: 'Marc',
    lastName: 'Manager',
    vehicleType: VehicleType.HYBRID,
    password: 'manager',
  });

  const employee1 = await upsertUser({
    email: 'employee1@corp.local',
    role: UserRole.EMPLOYEE,
    firstName: 'Emma',
    lastName: 'Employee',
    vehicleType: VehicleType.THERMAL,
    password: 'employee',
  });

  const employee2 = await upsertUser({
    email: 'employee2@corp.local',
    role: UserRole.EMPLOYEE,
    firstName: 'Ethan',
    lastName: 'Employee',
    vehicleType: VehicleType.ELECTRIC,
    password: 'employee',
  });

  const employee3 = await upsertUser({
    email: 'employee3@corp.local',
    role: UserRole.EMPLOYEE,
    firstName: 'Elise',
    lastName: 'Employee',
    vehicleType: VehicleType.HYBRID,
    password: 'employee',
  });

  const now = new Date();
  const d0 = dateAtMidnightUTC(now);
  const d1 = dateAtMidnightUTC(new Date(now.getTime() + 24 * 3600 * 1000));
  const d2 = dateAtMidnightUTC(new Date(now.getTime() + 2 * 24 * 3600 * 1000));
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

  for (let i = 0; i < 10; i++) {
    const date = dateAtMidnightUTC(
      new Date(now.getTime() + i * 24 * 3600 * 1000),
    );
    const checked = i % 3 === 0;

    await createReservation({
      userId: manager.id,
      spotId: 'D07',
      date,
      slot: ReservationSlot.AM,
      needsCharger: false,
      status: checked ? ReservationStatus.CHECKED_IN : ReservationStatus.BOOKED,
      checkIn: checked,
    });
  }

  await prisma.auditEvent.create({
    data: {
      action: 'SEED_COMPLETED',
      entity: 'DATABASE',
      entityId: 'seed',
      payload: {
        users: [
          secretary.email,
          manager.email,
          employee1.email,
          employee2.email,
          employee3.email,
        ],
      },
      actorId: secretary.id,
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
