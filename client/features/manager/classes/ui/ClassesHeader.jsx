"use client";

import { Plus, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ClassesHeader({ onCreate }) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/academics"
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="size-4" />
        Back to Academics
      </Link>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Class Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create classes, define standards, assign subjects, set student fees,
            and maintain a timetable for each class.
          </p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="size-4" />
          New Class
        </Button>
      </div>
    </div>
  );
}
