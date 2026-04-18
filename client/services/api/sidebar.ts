import { api, ApiResponse } from "./client";

export async function fetchCollegeSidebarAccess(): Promise<Record<string, string[]> | null> {
    try {
        const response = await api.get<Record<string, string[]>>("/sidebaraccess");
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch sidebar access:", error);
        return null;
    }
}

export async function updateCollegeSidebarAccess(map: Record<string, string[]>) {
    try {
        const response = await api.post<Record<string, string[]>>("/sidebaraccess", map);
        if (!response.success) {
            throw new Error(response.message || "Failed to update sidebar access");
        }
        return response.data;
    } catch (error) {
        console.error("Failed to update sidebar access:", error);
        throw error;
    }
}
