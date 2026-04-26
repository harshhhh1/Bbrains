"use client";

import { api } from "./base";

export const systemApi = {
  getConfigs: () => api.get<any[]>("/config"),
  updateConfig: (data: any) => api.post<any>("/config", data),
  deleteConfig: (key: string) => api.delete<any>(`/config/${key}`),
};
