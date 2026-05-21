import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

interface LoadingStateProps extends React.ComponentProps<"div"> {
  label?: React.ReactNode
  iconClassName?: string
}

function LoadingState({
  label = "Loading...",
  className,
  iconClassName,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-24 text-center", className)}
      {...props}
    >
      <Loader2 className={cn("size-8 animate-spin text-primary/50", iconClassName)} />
      {label ? (
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      ) : null}
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps }
