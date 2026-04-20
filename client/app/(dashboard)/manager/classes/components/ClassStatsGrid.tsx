"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Course } from "@/services/api/client";
import { formatCurrency } from "../utils/classes";

export function ClassStatsGrid({ classes }: { classes: Course[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Classes</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{classes.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Students Planned</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {classes.reduce((sum, course) => sum + Number(course.studentCapacity || 0), 0)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Average Fee</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {classes.length
              ? formatCurrency(
                  classes.reduce((sum, course) => sum + Number(course.feePerStudent || 0), 0) / classes.length
                )
              : formatCurrency(0)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Timetable Slots</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {classes.reduce((sum, course) => sum + (course.timetable?.length || 0), 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
