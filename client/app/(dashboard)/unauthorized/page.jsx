"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-[80vh] items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-dashed border-destructive/20 bg-destructive/5 text-center">
        <CardHeader className="pt-8">
          <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-black text-foreground">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground font-medium">
            u dont have permission to view this page
          </p>
          <p className="text-xs text-muted-foreground/60 px-6">
            If you believe this is a mistake, please contact your college
            administrator or the system support team.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-8 pt-4">
          <Link href="/dashboard">
            <Button className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
