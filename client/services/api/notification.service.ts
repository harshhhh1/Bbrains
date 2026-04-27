import { api } from "./base";
import type { NotificationUnreadCount, ApiNotification } from "@/lib/types/api";

export const notificationApi = {
  getNotifications: (page = 1, limit = 20) => api.get<{ notifications: ApiNotification[]; unreadCount: number }>(`/notifications?page=${page}&limit=${limit}`),
  getUnreadCount: () => api.get<NotificationUnreadCount>("/notifications/unread-count"),
  markAsRead: (id: string | number) => api.post<any>(`/notifications/${id}/read`),
  markRead: (id: string | number) => api.post<any>(`/notifications/${id}/read`),
  markAllAsRead: () => api.post<any>("/notifications/mark-all-read"),
  markAllRead: () => api.post<any>("/notifications/mark-all-read"),
  deleteNotification: (id: string | number) => api.delete<any>(`/notifications/${id}`),
  markChannelRead: (channelId: string) => api.post<any>(`/notifications/channel/${channelId}/read`),
  subscribePush: (subscription: any) => api.post<any>("/notifications/push/subscribe", subscription),
  unsubscribePush: (subscription: any) => api.post<any>("/notifications/push/unsubscribe", subscription),
};
