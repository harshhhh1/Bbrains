import { getAuthToken } from "@/services/api/client";
import type { ApiProduct } from "@/features/products/types";

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    return "http://localhost:5000";
};

async function fetchWithAuth<T>(endpoint: string): Promise<T | null> {
    const token = await getAuthToken();

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();

    if (!data.success) {
        return null;
    }

    return data.data as T;
}

export interface ProductsData {
    all: ApiProduct[];
    pending: ApiProduct[];
}

export function fmtCurrency(n: number | string): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n));
}

export async function fetchProducts(): Promise<ApiProduct[]> {
    const [all, pending] = await Promise.all([
        fetchWithAuth<ApiProduct[]>("/market/products"),
        fetchWithAuth<ApiProduct[]>("/market/pending"),
    ]);

    const validAll = all ?? [];
    const validPending = pending ?? [];

    const merged = [
        ...validPending,
        ...validAll.filter((p) => !validPending.some((q) => q.id === p.id)),
    ];

    return merged;
}
