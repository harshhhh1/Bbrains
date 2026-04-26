"use client";

import { api } from "./base";

export const chatApi = {
  getMembers: () => api.get<any[]>("/chat/members"),
  getMyProfile: () => api.get<any>("/chat/profile/me"),
  getMessages: (roomId?: string, limit = 50, before?: string) => 
    api.get<any[]>(`/chat/messages?roomId=${roomId || ""}&limit=${limit}${before ? `&before=${before}` : ""}`),
  searchMessages: (query: string, limit = 50, roomId?: string) => 
    api.get<any[]>(`/chat/messages/search?query=${query}&limit=${limit}${roomId ? `&roomId=${roomId}` : ""}`),
  searchUsers: (query: string, roomId?: string) => 
    api.get<any[]>(`/chat/search-users?query=${query}${roomId ? `&roomId=${roomId}` : ""}`),
};
