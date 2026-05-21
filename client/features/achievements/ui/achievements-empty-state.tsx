import { Trophy } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { PageContainer } from "@/components/layout/page-primitives"

export function AchievementsEmptyState() {
  return (
    <PageContainer>
      <EmptyState
        icon={<Trophy className="size-16" />}
        title="No Achievements Yet"
        description="Keep exploring the platform to unlock your first achievement."
        className="h-full border-0 bg-transparent p-8"
      />
    </PageContainer>
  )
}
