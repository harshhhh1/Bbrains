"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClassesHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Class Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create classes, define standards, assign subjects, set student fees, and maintain a timetable for each class.
        </p>
      </div>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="size-4" />
        New Class
      </Button>
    </div>
  );
}
