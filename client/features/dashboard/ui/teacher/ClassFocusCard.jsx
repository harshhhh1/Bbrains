import React from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BadgeIndianRupee } from "lucide-react";
import { CompactSummaryCard } from "./CompactSummaryCard";

export function ClassFocusCard({
  selectedCourseId,
  setSelectedCourseId,
  courses,
  incomeReceived,
  formatCurrency,
}) {
  return (
    <Card className="border-border/60 bg-card/95 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Class Focus
      </p>
      <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
        <SelectTrigger>
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="grid gap-3 mt-4">
        <CompactSummaryCard
          label="Salary Received"
          value={formatCurrency(incomeReceived)}
          sub="Successful credits"
          icon={<BadgeIndianRupee className="size-4" />}
          href="/transactions"
        />
      </div>
    </Card>
  );
}
