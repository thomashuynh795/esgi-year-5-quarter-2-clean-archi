export const USER_ROLES = ["EMPLOYEE", "MANAGER", "SECRETARY"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VEHICLE_TYPES = ["THERMAL", "HYBRID", "ELECTRIC"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const RESERVATION_SLOTS = ["AM", "PM"] as const;
export type ReservationSlot = (typeof RESERVATION_SLOTS)[number];

export type SpotStatus = "available" | "reserved" | "reservedByMe" | "unavailable";
export type ParkingSpotTileTone =
  | "available"
  | "reserved"
  | "reservedByMe"
  | "unavailable"
  | "dashboardAvailable"
  | "dashboardPartial"
  | "dashboardUnavailable"
  | "dashboardBlocked";

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
  tileTone?: ParkingSpotTileTone;
  badgeLabel?: "AM" | "PM";
  hideChargerBadge?: boolean;
}

export interface ReservationViewModel {
  id: string;
  date: string;
  slot: ReservationSlot;
  status: string;
  spotId: string;
  spotLabel: string;
  needsCharging?: boolean;
  canCheckIn: boolean;
  canCancel: boolean;
  canEdit?: boolean;
}

export interface ReservationHistoryEntry {
  date: string;
  slot: ReservationSlot;
  usedSpotIds: string[];
  freeSpotIds: string[];
}

export interface DailyOccupancySpot {
  spotId: string;
  row: string;
  number: number;
  hasCharger: boolean;
  isActive: boolean;
  isAvailableAM: boolean;
  isAvailablePM: boolean;
}

export interface DailyOccupancyViewModel {
  date: string;
  spots: DailyOccupancySpot[];
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
  monthLabel: string;
  totalSpots: number;
  electricSpots: number;
  totalReservations: number;
  totalCheckIns: number;
  totalNoShows: number;
  totalChargerRequests?: number;
  fillingRate: string;
  noShowRate: string;
  electricRate: string;
  chargerUsageRate: string;
  averageUsageRateLast30Days: string;
  averageCheckInRateLast30Days: string;
  monthlyReservationCount: number;
  monthlyCheckInCount: number;
  monthlyNoShowCount: number;
  workingDaysInMonth: number;
  averageReservationsPerWorkingDayInMonth: number;
  averageCheckInsPerWorkingDayInMonth: number;
  peakDailyReservationsInMonth: number;
  monthlyAverageOccupancyRate: string;
  monthlyPeakOccupancyRate: string;
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
