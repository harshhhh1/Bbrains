import Link from "next/link"
import { ArrowRight, BookOpen, GraduationCap, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ManagerOverviewStats } from "@/features/manager/dashboard/types/manager"

export function AcademicOverview({ stats }: { stats: ManagerOverviewStats }) {
    const { classes, teachers, totalStaff, students } = stats.people

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle>Academic Overview</CardTitle>
                <CardDescription>
                    Summary of courses, staff, and enrollment in the system.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-border/60 bg-muted/30 p-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em]">Courses / Classes</span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-foreground">{classes}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Active courses in the system</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-border/60 bg-muted/30 p-5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em]">Subjects</span>
                        </div>
                        <p className="mt-2 text-3xl font-bold text-foreground">--</p>
                        <p className="mt-1 text-sm text-muted-foreground">Across all courses</p>
                    </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/60  p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl  p-3 text-primary">
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Staff & Student Breakdown</p>
                                <p className="text-sm text-muted-foreground">
                                    {teachers} teachers, {totalStaff - teachers} other staff, {students} students
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/classes"
                            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            Manage
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
