import { Trophy } from "lucide-react"

export function UnauthenticatedState() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
      <Trophy className="h-16 w-16 text-muted-foreground/30" />
      <h2 className="text-xl font-semibold">Sign in to view achievements</h2>
      <p className="text-muted-foreground">
        Your unlocked milestones will appear here once you are signed in.
      </p>
    </div>
  )
}
