import { api } from "@/services/api/base";

export const gamificationApi = {
  getLeaderboard: (category: string, sortBy: string, limit = 20, offset = 0) => 
    api.get<any[]>(`/leaderboard?category=${category}&sortBy=${sortBy}&limit=${limit}&offset=${offset}`),
  getMyPosition: (category: string, sortBy: string) => 
    api.get<any>(`/leaderboard/me?category=${category}&sortBy=${sortBy}`),
  getMyAchievements: () => api.get<any[]>("/achievements/me"),
  getStreak: () => api.get<any>("/user/streaks"),
  getStreaks: () => api.get<any>("/user/streaks"),
  getLevels: () => api.get<any[]>("/xp/config"),
  createLevel: (levelNumber: number, requiredXp: number) => api.post<any>("/xp/config", { levelNumber, requiredXp }),
  updateLevel: (levelNumber: number, requiredXp: number) => api.put<any>(`/xp/config/${levelNumber}`, { requiredXp }),
  deleteLevel: (levelNumber: number) => api.delete<any>(`/xp/config/${levelNumber}`),
  getXpConfig: () => api.get<any[]>("/xp/config"),
  updateXpConfig: (data: any) => api.post<any>("/xp/config", data),
};
