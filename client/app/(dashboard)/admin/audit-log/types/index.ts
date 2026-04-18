import type { ApiAuditLog, LogCategory } from "@/lib/types/api";
export type { ApiAuditLog, LogCategory };

export const LOG_CATEGORIES: LogCategory[] = [
    "AUTH",
    "ACADEMIC",
    "MARKET",
    "FINANCE",
    "USER",
    "SYSTEM",
];

export const categoryColors: Record<string, string> = {
    AUTH: "bg-blue-500/10 text-blue-600",
    ACADEMIC: "bg-emerald-500/10 text-emerald-600",
    MARKET: "bg-orange-500/10 text-orange-600",
    FINANCE: "bg-amber-500/10 text-amber-600",
    USER: "bg-purple-500/10 text-purple-600",
    SYSTEM: "bg-slate-500/10 text-slate-600",
};
