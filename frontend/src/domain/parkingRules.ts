import type {
  ParkingSpot,
  ReservationDraft,
  ReservationSlot,
  ReservationValidationResult,
  SpotStatus,
  UserRole,
} from "./models";

export const PARKING_ROWS = ["A", "B", "C", "D", "E", "F"] as const;
export const SPOTS_PER_ROW = 10;

export function isElectricRow(row: string): boolean {
  return row === "A" || row === "F";
}

export function getRoleReservationLimit(roles: UserRole[]): number {
  return roles.includes("MANAGER") ? 30 : 5;
}

export function createSpotId(row: string, number: number): string {
  return `${row}${String(number).padStart(2, "0")}`;
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isReservationSlotPast(
  date: string,
  slot: ReservationSlot,
  now: Date = new Date(),
): boolean {
  const reservationDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(reservationDate.getTime())) {
    return false;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (reservationDate.getTime() < today.getTime()) {
    return true;
  }

  if (reservationDate.getTime() > today.getTime()) {
    return false;
  }

  if (slot === "AM") {
    const amCutoff = new Date(today);
    amCutoff.setHours(12, 0, 0, 0);
    return now.getTime() >= amCutoff.getTime();
  }

  const pmCutoff = new Date(today);
  pmCutoff.setHours(18, 0, 0, 0);
  return now.getTime() >= pmCutoff.getTime();
}

export function getBusinessDatesBetween(
  startDate: string,
  endDate: string,
): string[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days: string[] = [];

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return days;
  }

  const cursor = new Date(start);
  while (cursor <= end) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) {
      days.push(formatDateInput(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function validateReservationDraft(params: {
  draft: ReservationDraft;
  roles: UserRole[];
  spot: ParkingSpot;
  today: string;
}): ReservationValidationResult {
  const { draft, roles, spot, today } = params;
  const errors: string[] = [];
  const requestedDates = getBusinessDatesBetween(draft.startDate, draft.endDate);
  const limit = getRoleReservationLimit(roles);
  const electricRow = isElectricRow(spot.row);

  if (!draft.startDate || !draft.endDate) {
    errors.push("Choisissez une date de debut et une date de fin.");
  }

  if (draft.startDate < today) {
    errors.push("La reservation doit commencer aujourd'hui ou plus tard.");
  }

  if (draft.endDate < draft.startDate) {
    errors.push("La date de fin doit etre posterieure ou egale a la date de debut.");
  }

  if (requestedDates.length === 0) {
    errors.push("Selectionnez au moins un jour ouvre.");
  }

  if (requestedDates.length > limit) {
    errors.push(
      roles.includes("MANAGER")
        ? "Un manager ne peut pas reserver plus de 30 jours consecutifs."
        : "Un employe ne peut pas reserver plus de 5 jours ouvres.",
    );
  }

  if (draft.needsCharge && !electricRow) {
    errors.push("Le besoin de charge impose une place en rangee A ou F.");
  }

  if (electricRow && draft.vehicleType === "THERMAL") {
    errors.push("Les vehicules thermiques ne peuvent pas reserver les rangees A ou F.");
  }

  if (draft.needsCharge && draft.vehicleType === "THERMAL") {
    errors.push("Un vehicule thermique ne peut pas demander de recharge.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    blockedReason: errors[0],
    requestedDays: requestedDates.length,
  };
}

export function getSpotStatus(params: {
  spot: ParkingSpot;
  draft: ReservationDraft;
  reservedSpotIds: Set<string>;
  myReservedSpotIds: Set<string>;
}): SpotStatus {
  const { spot, draft, reservedSpotIds, myReservedSpotIds } = params;
  const electricRow = isElectricRow(spot.row);

  if (!spot.isActive) {
    return "unavailable";
  }

  if (myReservedSpotIds.has(spot.id)) {
    return "reservedByMe";
  }

  if (reservedSpotIds.has(spot.id)) {
    return "reserved";
  }

  if (draft.needsCharge && !electricRow) {
    return "unavailable";
  }

  if (electricRow && draft.vehicleType === "THERMAL") {
    return "unavailable";
  }

  return "available";
}
