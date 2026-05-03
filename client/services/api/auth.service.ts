import { api, makeRequest } from "@/services/api/base";
import type { ApiResponse } from "@/services/api/base";

export const authApi = {
  login: (data: any) => api.post<any>("/login", data),
  logout: () => api.post<any>("/logout"),
  forgotPassword: (email: string) => api.post<any>("/auth/forgot-password", { email }),
  updatePassword: (data: any) => api.post<any>("/auth/update-password", data),
};
