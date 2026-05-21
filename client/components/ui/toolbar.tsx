import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    />
  )
}

interface SearchFieldProps extends React.ComponentProps<typeof Input> {
  wrapperClassName?: string
  iconClassName?: string
}

function SearchField({ className, wrapperClassName, iconClassName, ...props }: SearchFieldProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
          iconClassName
        )}
      />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  )
}

export { SearchField, Toolbar }
export type { SearchFieldProps }
