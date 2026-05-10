import { Eye, Loader2, Pause, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollegeActions({
  isPaused,
  isTogglePauseLoading,
  onViewAsAdmin,
  onTogglePause,
  onDelete,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="default"
        onClick={onViewAsAdmin}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Eye className="mr-2 size-4" />
        View College
      </Button>

      <Button
        variant={isPaused ? "default" : "secondary"}
        onClick={onTogglePause}
        disabled={isTogglePauseLoading}
      >
        {isTogglePauseLoading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : isPaused ? (
          <Play className="mr-2 size-4" />
        ) : (
          <Pause className="mr-2 size-4" />
        )}
        {isPaused ? "Resume College" : "Pause College"}
      </Button>

      <Button variant="destructive" onClick={onDelete}>
        <Trash2 className="mr-2 size-4" />
        Delete
      </Button>
    </div>
  );
}
