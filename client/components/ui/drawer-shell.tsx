import * as React from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

const drawerWidth = {
  sm: "data-[vaul-drawer-direction=right]:sm:max-w-md",
  md: "data-[vaul-drawer-direction=right]:sm:max-w-2xl",
  lg: "data-[vaul-drawer-direction=right]:sm:max-w-4xl",
  xl: "data-[vaul-drawer-direction=right]:sm:max-w-6xl",
}

interface DrawerShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  width?: keyof typeof drawerWidth
  direction?: React.ComponentProps<typeof Drawer>["direction"]
  className?: string
  bodyClassName?: string
  footerClassName?: string
}

function DrawerShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = "sm",
  direction = "right",
  className,
  bodyClassName,
  footerClassName,
}: DrawerShellProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContent
        className={cn(
          "p-0 data-[vaul-drawer-direction=right]:w-full before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]",
          drawerWidth[width],
          className
        )}
      >
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>{title}</DrawerTitle>
                {description ? <DrawerDescription>{description}</DrawerDescription> : null}
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="size-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className={cn("flex-1 overflow-y-auto p-6", bodyClassName)}>{children}</div>
          {footer ? (
            <DrawerFooter className={cn("border-t border-border/60 p-6 sm:flex-row sm:justify-end", footerClassName)}>
              {footer}
            </DrawerFooter>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { DrawerShell }
export type { DrawerShellProps }
