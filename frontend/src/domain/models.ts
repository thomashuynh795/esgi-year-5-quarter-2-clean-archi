export const USER_ROLES = ["EMPLOYEE", "MANAGER", "SECRETARY"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VEHICLE_TYPES = ["THERMAL", "HYBRID", "ELECTRIC"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const RESERVATION_SLOTS = ["AM", "PM"] as const;
export type ReservationSlot = (typeof RESERVATION_SLOTS)[number];

export type SpotStatus = "available" | "reserved" | "reservedByMe" | "unavailable";

export interface AuthUser {
  id: string;
  email: string;
  roles: UserRole[];
  vehicleType: VehicleType | "NONE";
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface ParkingSpot {
  id: string;
  row: string;
  number: number;
  hasCharger: boolean;
  isActive: boolean;
}

export interface ParkingSpotViewModel extends ParkingSpot {
  status: SpotStatus;
  statusLabel: string;
  typeLabel: "Electric" | "Standard";
}

export interface ReservationViewModel {
  id: string;
  date: string;
  slot: ReservationSlot;
  status: string;
  spotId: string;
  spotLabel: string;
  canCheckIn: boolean;
  canCancel: boolean;
}

export interface ReservationHistoryEntry {
  date: string;
  slot: ReservationSlot;
  usedSpotIds: string[];
  freeSpotIds: string[];
}

export interface ReservationDraft {
  spotId: string;
  startDate: string;
  endDate: string;
  slot: ReservationSlot;
  vehicleType: VehicleType;
  needsCharge: boolean;
}

export interface ReservationValidationResult {
  isValid: boolean;
  errors: string[];
  blockedReason?: string;
  requestedDays: number;
}

export interface DashboardStatistics {
  date: string;
  totalSpots: number;
  electricSpots: number;
  totalReservations: number;
  totalCheckIns: number;
  fillingRate: string;
  noShowRate: string;
  electricRate: string;
}

export interface ApiReservationDto {
  id: string;
  date: string;
  status: string;
  period: ReservationSlot;
  slot: {
    id: string;
    name: string;
  };
}
