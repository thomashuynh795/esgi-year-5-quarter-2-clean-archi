import type {
  DashboardStatistics,
  ParkingSpot,
  ReservationHistoryEntry,
  ReservationViewModel,
} from "./models";
import { PARKING_ROWS, SPOTS_PER_ROW, createSpotId, formatDateInput, isElectricRow } from "./parkingRules";

export function buildMockParkingSpots(): ParkingSpot[] {
  return PARKING_ROWS.flatMap((row) =>
    Array.from({ length: SPOTS_PER_ROW }, (_, index) => {
      const number = index + 1;
      return {
        id: createSpotId(row, number),
        row,
        number,
        hasCharger: isElectricRow(row),
        isActive: true,
      };
    }),
  );
}

export function buildMockReservationHistory(start: string, end: string): ReservationHistoryEntry[] {
  const spots = buildMockParkingSpots();
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const entries: ReservationHistoryEntry[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const current = formatDateInput(cursor);
    for (const slot of ["AM", "PM"] as const) {
      const usedSpotIds = spots
        .filter((spot) => (spot.number + cursor.getDate() + (slot === "AM" ? 0 : 2)) % 4 === 0)
        .map((spot) => spot.id);

      entries.push({
        date: current,
        slot,
        usedSpotIds,
        freeSpotIds: spots.filter((spot) => !usedSpotIds.includes(spot.id)).map((spot) => spot.id),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return entries;
}

export function buildMockStats(date: string): DashboardStatistics {
  return {
    date,
    totalSpots: 60,
    electricSpots: 20,
    totalReservations: 34,
    totalCheckIns: 29,
    fillingRate: "57%",
    noShowRate: "15%",
    electricRate: "33%",
  };
}

export function buildMockReservations(): ReservationViewModel[] {
  return [
    {
      id: "mock-1",
      date: formatDateInput(new Date()),
      slot: "AM",
      status: "CONFIRMED",
      spotId: "B03",
      spotLabel: "B03",
      canCheckIn: true,
      canCancel: true,
    },
  ];
}
