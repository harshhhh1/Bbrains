import { Loader2 } from "lucide-react";

export function AcademicsLoadingState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="animate-pulse text-sm font-medium text-muted-foreground">
        Loading academic records...
      </p>
    </div>
  );
}
