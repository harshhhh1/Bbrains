import { Skeleton } from "@/components/ui/skeleton"

export function AchievementsLoadingState() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <div className="mb-8">
        <Skeleton className="mb-2 h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <Skeleton className="mb-4 h-16 w-16 rounded-full" />
              <Skeleton className="mb-2 h-6 w-32" />
              <Skeleton className="mb-4 h-4 w-full" />
              <div className="mt-auto flex space-x-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="mt-4 h-8 w-full border-t pt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
