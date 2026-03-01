import type { AuthUser, DashboardStatistics, UserRole } from "../domain/models";
import api from "./api";

interface UserDto {
  id: string;
  email: string;
  roles: UserRole[];
  vehicleType: AuthUser["vehicleType"];
  firstName?: string | null;
  lastName?: string | null;
  isActive?: boolean;
}

function mapUser(dto: UserDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    roles: dto.roles ?? [],
    vehicleType: dto.vehicleType ?? "NONE",
    firstName: dto.firstName ?? undefined,
    lastName: dto.lastName ?? undefined,
    isActive: dto.isActive ?? true,
  };
}

export const AdminService = {
  async getStatistics(date: string): Promise<DashboardStatistics> {
    const response = await api.get<DashboardStatistics>(`/dashboard/statistics/${date}`);
    return response.data;
  },

  async createUser(input: {
    email: string;
    firstName: string;
    lastName: string;
    vehicleType: AuthUser["vehicleType"];
  }): Promise<void> {
    await api.post("/users", {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      vehicleType: input.vehicleType,
    });
  },

  async getUsers(): Promise<AuthUser[]> {
    const response = await api.get<UserDto[]>("/users");
    return response.data.map(mapUser);
  },

  async updateUser(input: {
    userId: string;
    firstName?: string;
    lastName?: string;
    roles: UserRole[];
    vehicleType: AuthUser["vehicleType"];
    isActive: boolean;
  }): Promise<void> {
    await api.patch(`/users/${input.userId}`, {
      firstName: input.firstName,
      lastName: input.lastName,
      roles: input.roles,
      vehicleType: input.vehicleType,
      isActive: input.isActive,
    });
  },
};
