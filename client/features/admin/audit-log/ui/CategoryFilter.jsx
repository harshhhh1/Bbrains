"use client";

import { Button } from "@/components/ui/button";
import { LOG_CATEGORIES } from "@/features/admin/audit-log/types";
import { cn } from "@/lib/utils";

export function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/30 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 px-3 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
          selectedCategory === ""
            ? "bg-background text-foreground shadow-sm hover:bg-background"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        onClick={() => onCategoryChange("")}
      >
        All
      </Button>
      {LOG_CATEGORIES.map((cat) => (
        <Button
          key={cat}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-3 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all",
            selectedCategory === cat
              ? "bg-background text-foreground shadow-sm hover:bg-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  );
}
