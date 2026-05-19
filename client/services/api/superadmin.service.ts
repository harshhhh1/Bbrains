import { api } from "@/services/api/base";

export interface DashboardStats {
  totalColleges: number;
  totalUsers: number;
  totalCourses: number;
  recentColleges: Array<{
    id: number;
    name: string;
    createdAt: string;
  }>;
}

export interface TopCollege {
  id: number;
  name: string;
  email: string;
  userCount: number;
}

export interface AuditLog {
  id: number;
  category: string;
  action: string;
  entity: string;
  entityId: string;
  change: any;
  reason: string | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    userDetails?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface PendingActions {
  pendingProducts: number;
  pendingSuggestions: number;
  totalPending: number;
}

export const superadminService = {
  getDashboardStats: () => api.get<DashboardStats>("/superadmin/dashboard/stats"),
  getTopColleges: (limit = 5) => api.get<TopCollege[]>("/superadmin/dashboard/top-colleges", { params: { limit } }),
  getRecentAuditLogs: (limit = 10) => api.get<AuditLog[]>("/superadmin/dashboard/recent-logs", { params: { limit } }),
  getPendingActions: () => api.get<PendingActions>("/superadmin/dashboard/pending-actions"),
  listColleges: () => api.get<any[]>("/superadmin/colleges"),
  getCollegeFeatures: (id: number) => api.get<any>(`/superadmin/colleges/${id}/features`),
  updateCollegeFeatures: (id: number, features: any) => api.put<any>(`/superadmin/colleges/${id}/features`, { features }),
  getGlobalFeatures: () => api.get<any>("/superadmin/features/global"),
  updateGlobalFeatures: (features: any) => api.put<any>("/superadmin/features/global", { features }),
};
