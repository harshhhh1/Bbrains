import { format } from "date-fns"
import { Calendar, Sparkles, Trophy } from "lucide-react"
import type { UserAchievement } from "@/services/api/client"

interface AchievementCardProps {
  item: UserAchievement
}

export function AchievementCard({ item }: AchievementCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 h-16 w-16 rounded-full bg-primary/10" />

      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {item.achievement.icon ? (
            <img
              src={item.achievement.icon}
              alt={item.achievement.name}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <Trophy className="h-8 w-8" />
          )}
        </div>

        <h3 className="mb-1 text-lg font-semibold">
          {item.achievement.name}
        </h3>

        {item.achievement.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {item.achievement.description}
          </p>
        )}

        <div className="mt-auto flex items-center space-x-4">
          <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Sparkles className="mr-1 h-3 w-3" />
            +{item.achievement.rewardXP} XP
          </span>
          <span className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400">
            <img src="/bcoin.svg" className="mr-1 h-3.5 w-3.5 mb-0.5" alt="" />
            +{item.achievement.rewardCoins}
          </span>
        </div>

        <div className="mt-4 flex w-full items-center justify-center border-t pt-4 text-xs text-muted-foreground">
          <Calendar className="mr-1.5 h-3 w-3" />
          Unlocked on {format(new Date(item.unlockedAt), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  )
}
