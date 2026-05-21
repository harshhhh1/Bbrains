import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pageContainerVariants = cva("mx-auto w-full", {
  variants: {
    width: {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-[96rem]",
      full: "max-w-none",
    },
    padding: {
      none: "",
      sm: "p-4 pb-24 md:p-5 md:pb-8",
      default: "p-4 pb-24 md:p-6 md:pb-8",
      spacious: "p-6 pb-24 md:p-12 md:pb-10",
    },
    gap: {
      none: "",
      sm: "space-y-4",
      default: "space-y-6",
      lg: "space-y-8",
      xl: "space-y-10",
    },
  },
  defaultVariants: {
    width: "xl",
    padding: "default",
    gap: "default",
  },
})

type PageContainerProps = React.ComponentProps<"div"> &
  VariantProps<typeof pageContainerVariants> & {
    maxWidth?: string
  }

function PageContainer({
  className,
  width,
  padding,
  gap,
  maxWidth,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(pageContainerVariants({ width, padding, gap }), maxWidth, className)}
      {...props}
    />
  )
}

function ContentWrapper({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("w-full min-w-0", className)} {...props} />
}

const stackVariants = cva("flex flex-col", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      default: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
  },
  defaultVariants: {
    gap: "default",
  },
})

function Stack({
  className,
  gap,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof stackVariants>) {
  return <div className={cn(stackVariants({ gap }), className)} {...props} />
}

const gridVariants = cva("grid min-w-0", {
  variants: {
    gap: {
      sm: "gap-3",
      default: "gap-4",
      lg: "gap-6",
    },
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
      auto: "grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]",
    },
  },
  defaultVariants: {
    gap: "default",
    columns: 1,
  },
})

function Grid({
  className,
  gap,
  columns,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof gridVariants>) {
  return <div className={cn(gridVariants({ gap, columns }), className)} {...props} />
}

function DashboardGrid({
  className,
  columns = 4,
  gap,
  ...props
}: React.ComponentProps<"div"> & Pick<VariantProps<typeof gridVariants>, "columns" | "gap">) {
  return <Grid columns={columns} gap={gap} className={className} {...props} />
}

function PageSection({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("space-y-4", className)} {...props} />
}

interface HeaderAction {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
}

interface PageHeaderProps extends Omit<React.ComponentProps<"header">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  titleClassName?: string
  descriptionClassName?: string
}

function PageHeader({
  title,
  description,
  eyebrow,
  meta,
  actions,
  titleClassName,
  descriptionClassName,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className={cn("text-2xl font-bold tracking-tight text-foreground md:text-3xl", titleClassName)}>
          {title}
        </h1>
        {description ? (
          <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>{description}</p>
        ) : null}
        {meta}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      {children}
    </header>
  )
}

interface SectionHeaderProps extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

function SectionHeader({
  title,
  description,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)} {...props}>
      <div className="min-w-0 space-y-1">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export {
  ContentWrapper,
  DashboardGrid,
  Grid,
  PageContainer,
  PageHeader,
  PageSection,
  SectionHeader,
  Stack,
  pageContainerVariants,
}

export type { HeaderAction, PageContainerProps, PageHeaderProps, SectionHeaderProps }
