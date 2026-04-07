"use client";

import React from "react";
import { Check, X, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AttendanceStatsProps {
    stats: {
        total: number;
        present: number;
        absent: number;
        late: number;
        unmarked: number;
    };
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Present</p>
                            <h3 className="text-2xl font-bold">{stats.present}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                            <X className="h-4 w-4 text-red-600 dark:text-red-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Absent</p>
                            <h3 className="text-2xl font-bold">{stats.absent}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Late</p>
                            <h3 className="text-2xl font-bold">{stats.late}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Loader2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">Unmarked</p>
                            <h3 className="text-2xl font-bold">{stats.unmarked}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
