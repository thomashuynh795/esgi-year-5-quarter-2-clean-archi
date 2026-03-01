import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const message = Array.isArray(backendMessage)
      ? backendMessage.join(" ")
      : backendMessage || error.message || "Une erreur est survenue.";

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-unauthorized"));
    }

    return Promise.reject(new ApiError(message, status, error.response?.data));
  },
);

export default api;
