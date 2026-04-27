import { api } from "./base";
import type { ApiUser } from "@/lib/types/api";

export const userApi = {
  getMe: () => api.get<ApiUser>("/user/me"),
  getStudents: () => api.get<any[]>("/users/students"),
  getTeachers: () => api.get<any[]>("/users/teachers"),
  getStaff: () => api.get<any[]>("/user/staff"),
  getManagers: () => api.get<any[]>("/user/managers"),
  deleteUser: (userId: string) => api.delete<any>(`/user/delete/${userId}`),
  fixRoles: () => api.post<{ count: number }>("/users/fix-roles"),
  updateProfile: (userId?: string, data?: any) => userId ? api.put<ApiUser>(`/user/${userId}/profile`, data) : api.put<ApiUser>("/user/profile", data),
  updateDetails: (data: any) => api.put<ApiUser>("/user/details", data),
  checkUsername: (username: string) => api.get<{ available: boolean; message?: string }>(`/user/check-username?username=${username}`),
  getRoles: () => api.get<any[]>("/roles"),
  getUserRoles: (userId: string) => api.get<any[]>(`/roles/users/${userId}`),
  assignRole: (userId: string, roleId: number) => api.post<any>(`/roles/users/${userId}/assign`, { roleId }),
  removeRole: (userId: string, roleId: number) => api.delete<any>(`/roles/users/${userId}/${roleId}`),
};
