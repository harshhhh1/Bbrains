import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const baseCardVariants = cva("border-border/60 shadow-sm", {
  variants: {
    tone: {
      default: "bg-card",
      muted: "bg-muted/20",
      subtle: "bg-card/60",
      transparent: "bg-transparent shadow-none",
    },
    interactive: {
      true: "transition-all hover:border-primary/30 hover:shadow-md",
      false: "",
    },
  },
  defaultVariants: {
    tone: "default",
    interactive: false,
  },
})

type BaseCardProps = React.ComponentProps<typeof Card> &
  VariantProps<typeof baseCardVariants> & {
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    headerClassName?: string
    contentClassName?: string
    titleClassName?: string
    descriptionClassName?: string
  }

function BaseCard({
  title,
  description,
  action,
  children,
  className,
  headerClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  tone,
  interactive,
  ...props
}: BaseCardProps) {
  return (
    <Card className={cn(baseCardVariants({ tone, interactive }), className)} {...props}>
      {(title || description || action) ? (
        <CardHeader className={cn("gap-3", headerClassName)}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              {title ? <CardTitle className={titleClassName}>{title}</CardTitle> : null}
              {description ? (
                <CardDescription className={descriptionClassName}>{description}</CardDescription>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      {children ? <CardContent className={cn(contentClassName)}>{children}</CardContent> : null}
    </Card>
  )
}

interface StatCardProps extends React.ComponentProps<typeof Card> {
  label: React.ReactNode
  value: React.ReactNode
  icon?: React.ReactNode
  note?: React.ReactNode
  accentClassName?: string
}

function StatCard({
  label,
  value,
  icon,
  note,
  className,
  accentClassName,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("border-border/60 shadow-sm", className)} {...props}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </p>
            <p className={cn("mt-1 text-3xl font-bold text-foreground", accentClassName)}>
              {value}
            </p>
            {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
          </div>
          {icon ? (
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function InfoCard(props: BaseCardProps) {
  return <BaseCard tone="subtle" {...props} />
}

function ActionCard(props: BaseCardProps) {
  return <BaseCard interactive {...props} />
}

export { ActionCard, BaseCard, InfoCard, StatCard, baseCardVariants }
