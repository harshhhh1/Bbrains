import { api } from "@/services/api/base";

export const dashboardService = {
  getDashboard: () => api.get<any>("/dashboard"),
  getAdminOverview: () => api.get<any>("/dashboard/admin"),
  getManagerOverview: () => api.get<any>("/dashboard/manager"),
  claimDaily: () => api.post<any>("/dashboard/claim-daily"),
};
