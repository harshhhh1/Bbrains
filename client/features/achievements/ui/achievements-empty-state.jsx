import { Trophy } from "lucide-react";

export function AchievementsEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
      <Trophy className="h-16 w-16 text-muted-foreground/30" />
      <h2 className="text-xl font-semibold">No Achievements Yet</h2>
      <p className="text-muted-foreground">
        Keep exploring the platform to unlock your first achievement.
      </p>
    </div>
  );
}
