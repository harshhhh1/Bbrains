import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
