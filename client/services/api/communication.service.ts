import { api } from "./base";

export const communicationApi = {
  getAnnouncements: () => api.get<any[]>("/announcements"),
  createAnnouncement: (data: any) => api.post<any>("/announcements", data),
  deleteAnnouncement: (id: string | number) => api.delete<any>(`/announcements/${id}`),
  acknowledgeAnnouncement: (id: string | number) => api.post<any>(`/announcements/${id}/acknowledge`),
  getAcknowledgedUsers: (id: string | number) => api.get<any[]>(`/announcements/${id}/acknowledged`),
  
  getEvents: () => api.get<any[]>("/events"),
  getUpcomingEvents: () => api.get<any[]>("/events/upcoming"),
  getEvent: (id: string | number) => api.get<any>(`/events/${id}`),
  createEvent: (data: any) => api.post<any>("/events", data),
  
  getSuggestions: () => api.get<any[]>("/suggestions"),
  createSuggestion: (data: any) => api.post<any>("/suggestions", data),
  voteSuggestion: (id: string | number, type: "up" | "down") => api.post<any>(`/suggestions/${id}/vote`, { type }),
  updateStatus: (id: number | string, status: string) => api.patch<any>(`/suggestions/${id}/status`, { status }),
  deleteSuggestion: (id: number | string) => api.delete<any>(`/suggestions/${id}`),
};
