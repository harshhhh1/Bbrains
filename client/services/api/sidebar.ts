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
        return await api.post<Record<string, string[]>>("/sidebaraccess", map);
    } catch (error: any) {
        console.error("Failed to update sidebar access:", error);
        return { success: false, message: error.message || "Unknown error occurred" } as any;
    }
}
