"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Settings } from "lucide-react";
import Link from "next/link";

export function SuperadminActions() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/colleges">
            <Plus className="h-4 w-4" />
            Add College
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/announcements?mode=global">
            <Megaphone className="h-4 w-4" />
            Global Announcement
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/config/sidebar-access">
            <Settings className="h-4 w-4" />
            System Config
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
