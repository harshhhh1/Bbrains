import { Loader2 } from "lucide-react";

export default function GlobalDashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-bold text-muted-foreground/30 animate-pulse">
        Loading Data...
      </p>
    </div>
  );
}
