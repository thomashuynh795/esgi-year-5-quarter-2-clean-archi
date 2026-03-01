import type { AuthUser, UserRole } from "../domain/models";
import api from "./api";

interface LoginResponseDto {
  jwt: string;
}

interface UserDto {
  id: string;
  email: string;
  roles: UserRole[];
  vehicleType: AuthUser["vehicleType"];
  firstName?: string | null;
  lastName?: string | null;
  isActive?: boolean;
}

function mapUserDto(dto: UserDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    roles: dto.roles ?? [],
    vehicleType: dto.vehicleType ?? "NONE",
    firstName: dto.firstName ?? undefined,
    lastName: dto.lastName ?? undefined,
    isActive: dto.isActive,
  };
}

export function decodeJwt(token: string): { sub?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = window.atob(base64);
    return JSON.parse(payload) as { sub?: string };
  } catch {
    return null;
  }
}

export const AuthService = {
  async login(email: string, password: string): Promise<string> {
    const response = await api.post<LoginResponseDto>("/auth/login", { email, password });
    return response.data.jwt;
  },

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const response = await api.get<UserDto>(`/users/${userId}`);
    const user = mapUserDto(response.data);

    if (!user.roles.length) {
      const roleResponse = await api.get<{ roles: UserRole[] }>("/auth/get-role");
      user.roles = roleResponse.data.roles ?? [];
    }

    return user;
  },
};
