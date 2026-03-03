import type {
  ApiReservationDto,
  DailyOccupancyViewModel,
  ParkingSpot,
  ReservationHistoryEntry,
  ReservationViewModel,
  ReservationSlot,
} from "../domain/models";
import { getBusinessDatesBetween, isElectricRow } from "../domain/parkingRules";
import api from "./api";

type ApiScalar<T> = T | { value: T } | null | undefined;

interface ParkingSpotDto {
  id?: ApiScalar<string>;
  row?: string;
  number?: number;
  hasCharger?: boolean;
  isActive?: boolean;
}

interface ApiReservationSlotDto {
  id?: ApiScalar<string>;
  name?: ApiScalar<string>;
}

interface ApiReservationResponseDto extends Omit<ApiReservationDto, "slot"> {
  slot?: ApiReservationSlotDto;
}

function unwrapApiValue<T>(value: ApiScalar<T>): T | undefined {
  if (value && typeof value === "object" && "value" in value) {
    return value.value;
  }
  return value ?? undefined;
}

function toIsoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString().slice(0, 10);
}

function normalizeSpotId(dto: ParkingSpotDto): string {
  const rawId = unwrapApiValue(dto.id);
  if (rawId) {
    return String(rawId);
  }

  const row = dto.row ?? "A";
  const number = String(dto.number ?? 1).padStart(2, "0");
  return `${row}${number}`;
}

function mapParkingSpot(dto: ParkingSpotDto): ParkingSpot {
  const id = normalizeSpotId(dto);
  const row = dto.row ?? id.charAt(0);
  const number = dto.number ?? Number(id.slice(1));

  return {
    id,
    row,
    number,
    hasCharger: dto.hasCharger ?? isElectricRow(row),
    isActive: dto.isActive ?? true,
  };
}

function mapReservation(dto: ApiReservationResponseDto): ReservationViewModel {
  const status = dto.status ?? "CONFIRMED";
  const spotId = unwrapApiValue(dto.slot?.id) ?? unwrapApiValue(dto.slot?.name) ?? "Unknown";
  const spotLabel = unwrapApiValue(dto.slot?.name) ?? unwrapApiValue(dto.slot?.id) ?? "Unknown";
  return {
    id: dto.id,
    date: toIsoDate(dto.date),
    slot: dto.period,
    status,
    spotId,
    spotLabel,
    canCheckIn: status === "BOOKED" || status === "CONFIRMED",
    canCancel: status !== "CANCELLED" && status !== "CHECKED_IN",
  };
}

export const ParkingService = {
  async getAllSpots(): Promise<ParkingSpot[]> {
    const response = await api.get<ParkingSpotDto[]>("/parking-spots");
    return response.data.map(mapParkingSpot);
  },

  async getMyReservations(): Promise<ReservationViewModel[]> {
    const response = await api.get<ApiReservationResponseDto[]>("/reservations/me");
    return response.data.map(mapReservation);
  },

  async getReservationsForUser(userId: string): Promise<ReservationViewModel[]> {
    const response = await api.get<ApiReservationResponseDto[]>(`/reservations/user/${userId}`);
    return response.data.map(mapReservation);
  },

  async getReservationHistory(params: {
    start: string;
    end: string;
    slot?: ReservationSlot;
  }): Promise<ReservationHistoryEntry[]> {
    const response = await api.get<ReservationHistoryEntry[]>("/reservations/history", {
      params: {
        start: params.start,
        end: params.end,
        period: params.slot,
      },
    });
    return response.data;
  },

  async getDailyOccupancy(date: string): Promise<DailyOccupancyViewModel> {
    const response = await api.get<DailyOccupancyViewModel>("/reservations/daily-occupancy", {
      params: { date },
    });
    return response.data;
  },

  async createReservation(input: {
    spotId: string;
    startDate: string;
    endDate: string;
    slot: ReservationSlot;
    needsCharge: boolean;
  }): Promise<void> {
    const duration = getBusinessDatesBetween(input.startDate, input.endDate).length;

    await api.post("/reservations", {
      spotId: input.spotId,
      startDate: input.startDate,
      slot: input.slot,
      duration,
      needsCharging: input.needsCharge,
    });
  },

  async cancelReservation(reservationId: string): Promise<void> {
    await api.delete(`/reservations/${reservationId}`);
  },

  async checkIn(reservationId: string): Promise<void> {
    await api.post(`/reservations/${reservationId}/check-in`);
  },

  async checkInByQr(spotId: string): Promise<void> {
    await api.post(`/reservations/check-in/qr/${spotId}`);
  },

  async updateReservation(input: {
    reservationId: string;
    spotId?: string;
    date?: string;
    slot?: ReservationSlot;
    needsCharging?: boolean;
  }): Promise<void> {
    await api.patch(`/reservations/${input.reservationId}`, {
      spotId: input.spotId,
      date: input.date,
      slot: input.slot,
      needsCharging: input.needsCharging,
    });
  },
};
