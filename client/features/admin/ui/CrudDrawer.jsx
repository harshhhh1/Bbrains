"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CrudDrawer({
  open,
  onClose,
  title,
  description,
  onSubmit,
  submitting,
  children,
  submitLabel = "Save",
  maxWidth = "sm:max-w-md md:max-w-xl",
}) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 gap-0 border-l border-border bg-card overflow-hidden w-full sm:w-[90vw]",
          maxWidth,
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50 text-left">
          <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-sm text-muted-foreground">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">{children}</div>
        </div>

        <SheetFooter className="flex-row items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4 mt-auto">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="font-medium shrink-0"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white min-w-[100px] font-semibold shadow-lg shadow-brand-purple/20 transition-all active:scale-95 shrink-0"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
