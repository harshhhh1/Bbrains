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
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/50">
          Learnytics
        </h3>
        <p className="text-xs font-bold text-muted-foreground/30 animate-pulse">
          Syncing Records...
        </p>
      </div>
    </div>
  );
}
