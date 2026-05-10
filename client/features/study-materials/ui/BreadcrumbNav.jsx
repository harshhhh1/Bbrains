import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function BreadcrumbNav({ breadcrumbs, onNavigate }) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isRoot = index === 0;

        return (
          <div key={crumb.prefix} className="flex items-center shrink-0">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
            )}
            <button
              onClick={() => onNavigate(crumb.prefix)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-sm font-medium whitespace-nowrap",
                isLast
                  ? "text-foreground bg-accent/50 cursor-default"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
              disabled={isLast}
            >
              {isRoot && <Home className="h-4 w-4" />}
              <span>{crumb.displayName || crumb.name}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
