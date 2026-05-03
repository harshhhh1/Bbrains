import { api } from "@/services/api/base";

export const chatApi = {
  getMembers: () => api.get<any[]>("/chat/members"),
  getMyProfile: () => api.get<any>("/chat/profile/me"),
  getMessages: (roomId?: string, limit = 50, before?: string) => 
    api.get<any[]>(`/chat/messages?roomId=${roomId || ""}&limit=${limit}${before ? `&before=${before}` : ""}`),
  searchMessages: (query: string, limit = 50, roomId?: string) => 
    api.get<any[]>(`/chat/messages/search?q=${encodeURIComponent(query)}&limit=${limit}${roomId ? `&chatId=${roomId}` : ""}`),
  searchUsers: (query: string, roomId?: string) => 
    api.get<any[]>(`/chat/search-users?q=${query}${roomId ? `&roomId=${roomId}` : ""}`),
};
