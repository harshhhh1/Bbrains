import * as React from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps extends Omit<React.ComponentProps<"div">, "title"> {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/10 px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon ? <div className="mb-4 text-muted-foreground/40">{icon}</div> : null}
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
