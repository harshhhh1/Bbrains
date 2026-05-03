"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function TabButton({
  value,
  icon,
  label,
  note,
}: {
  value: string;
  icon: ReactNode;
  label: string;
  note: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "!h-auto items-start justify-start rounded-[1.5rem] border border-transparent p-6 text-left shadow-none",
        "data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      )}
    >
      <div className="flex w-full items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground">{label}</p>
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{note}</p>
        </div>
      </div>
    </TabsTrigger>
  );
}

export function SectionCard({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-border/60 shadow-sm", className)}>
      <CardHeader className="p-6 md:p-8">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 md:p-8 md:pt-0">{children}</CardContent>
    </Card>
  );
}

export function FieldBlock({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border/60 bg-background/80 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

export function PinSlots({
  value,
  onChange,
  tone = "default",
}: {
  value: string;
  onChange: (value: string) => void;
  tone?: "default" | "primary";
}) {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className={cn(
              "h-11 w-9 rounded-xl border bg-background text-base font-semibold sm:h-12 sm:w-10",
              tone === "primary" ? "border-primary/30" : "border-border"
            )}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
