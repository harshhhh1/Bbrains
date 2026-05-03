import Link from "next/link";
import React, { ReactNode } from "react";

interface CompactSummaryCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: ReactNode;
  color?: string;
  href?: string;
}

export function CompactSummaryCard({ label, value, sub, icon, color = "text-primary", href }: CompactSummaryCardProps) {
  const content = (
    <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm transition-all hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{sub}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
      </div>
    </div>
  );
  if (!href) return content;
  return <Link href={href} className="block">{content}</Link>;
}
