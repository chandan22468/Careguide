import { apiClient } from "./api.ts";
import { CareSession } from "../types/session.ts";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResult {
  user: AuthUser;
  session: CareSession;
}

export const authService = {
  async current(): Promise<AuthResult> {
    const response = await apiClient.get<AuthResult>("/auth/me");
    return response.data;
  },

  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const response = await apiClient.post<AuthResult>("/auth/register", input);
    return response.data;
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const response = await apiClient.post<AuthResult>("/auth/login", input);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
};
