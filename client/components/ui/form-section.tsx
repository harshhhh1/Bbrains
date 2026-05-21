import * as React from "react"

import { cn } from "@/lib/utils"

interface FormSectionProps extends Omit<React.ComponentProps<"section">, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

function FormSection({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4 rounded-2xl border border-border/60 p-4", className)} {...props}>
      {(title || description || actions) ? (
        <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
          <div className="min-w-0 space-y-1">
            {title ? <h3 className="font-semibold text-foreground">{title}</h3> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export { FormSection }
export type { FormSectionProps }
