"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getAssignments, getMyGrades } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GraduationCap, Calendar, CheckCircle, Clock, BookOpen } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { cn } from '@/lib/utils'

dayjs.extend(relativeTime)

interface Assignment {
    id: number
    title: string
    description?: string
    dueDate?: string
    course?: { name: string }
    _count?: { submissions: number }
}

interface Grade {
    id: number
    grade: string
    gradedAt: string
    gradedBy: string
    assignment?: { title: string; course?: { name: string } }
}

function gradeColor(grade: string) {
    const g = grade?.charAt(0)?.toUpperCase()
    if (g === 'A') return 'bg-green-100 text-green-700 border-green-200'
    if (g === 'B') return 'bg-blue-100 text-blue-700 border-blue-200'
    if (g === 'C') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    if (g === 'D') return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-red-100 text-red-700 border-red-200'
}

export default function ExamsPage() {
    const { user, isLoading: authLoading } = useAuth()
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [grades, setGrades] = useState<Grade[]>([])
    const [loading, setLoading] = useState(true)

    const isStudent = user?.type === 'student' || !user?.type

    useEffect(() => {
        if (authLoading) return
        const load = async () => {
            try {
                const [a, g] = await Promise.all([
                    getAssignments().catch(() => []),
                    isStudent ? getMyGrades().catch(() => []) : Promise.resolve([]),
                ])
                setAssignments(Array.isArray(a) ? a : [])
                setGrades(Array.isArray(g) ? g : [])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [authLoading, isStudent])

    const now = dayjs()
    const upcoming = assignments.filter((a) => !a.dueDate || dayjs(a.dueDate).isAfter(now))
    const past = assignments.filter((a) => a.dueDate && dayjs(a.dueDate).isBefore(now))

    const gradedAssignmentIds = new Set(grades.map((g) => g.assignment?.title))

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <GraduationCap size={20} className="text-purple-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Assignments & Exams</h1>
                    <p className="text-sm text-gray-500">Track your assignments and grades</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : (
                <Tabs defaultValue="upcoming">
                    <TabsList>
                        <TabsTrigger value="upcoming" className="gap-2">
                            <Clock size={14} />
                            Upcoming ({upcoming.length})
                        </TabsTrigger>
                        <TabsTrigger value="past" className="gap-2">
                            <CheckCircle size={14} />
                            Past ({past.length})
                        </TabsTrigger>
                        {isStudent && (
                            <TabsTrigger value="grades" className="gap-2">
                                <BookOpen size={14} />
                                My Grades ({grades.length})
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="upcoming" className="mt-4 space-y-3">
                        {upcoming.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                                <CheckCircle size={40} strokeWidth={1.5} />
                                <p className="text-sm">No upcoming assignments</p>
                            </div>
                        ) : (
                            upcoming.map((a) => (
                                <AssignmentCard key={a.id} assignment={a} isGraded={gradedAssignmentIds.has(a.title)} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="mt-4 space-y-3">
                        {past.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                                <Calendar size={40} strokeWidth={1.5} />
                                <p className="text-sm">No past assignments</p>
                            </div>
                        ) : (
                            past.map((a) => (
                                <AssignmentCard key={a.id} assignment={a} isPast isGraded={gradedAssignmentIds.has(a.title)} />
                            ))
                        )}
                    </TabsContent>

                    {isStudent && (
                        <TabsContent value="grades" className="mt-4 space-y-3">
                            {grades.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                                    <BookOpen size={40} strokeWidth={1.5} />
                                    <p className="text-sm">No grades yet</p>
                                </div>
                            ) : (
                                grades.map((g) => <GradeCard key={g.id} grade={g} />)
                            )}
                        </TabsContent>
                    )}
                </Tabs>
            )}
        </div>
    )
}

function AssignmentCard({ assignment, isPast, isGraded }: { assignment: Assignment; isPast?: boolean; isGraded?: boolean }) {
    const dueDate = assignment.dueDate ? dayjs(assignment.dueDate) : null
    const isOverdue = dueDate && dueDate.isBefore(dayjs()) && !isPast

    return (
        <Card className={cn('gap-0 py-0 overflow-hidden', isPast && 'opacity-70')}>
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        isGraded ? 'bg-green-50' : isOverdue ? 'bg-red-50' : 'bg-purple-50'
                    )}>
                        {isGraded
                            ? <CheckCircle size={20} className="text-green-600" />
                            : <GraduationCap size={20} className={isOverdue ? 'text-red-600' : 'text-purple-600'} />
                        }
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm">{assignment.title}</h3>
                            {isGraded && <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">Graded</Badge>}
                            {isOverdue && <Badge variant="outline" className="text-xs text-red-600 border-red-200 bg-red-50">Overdue</Badge>}
                        </div>
                        {assignment.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{assignment.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                            {assignment.course && (
                                <span className="flex items-center gap-1">
                                    <BookOpen size={11} />
                                    {assignment.course.name}
                                </span>
                            )}
                            {dueDate && (
                                <span className={cn('flex items-center gap-1', isOverdue && 'text-red-500')}>
                                    <Calendar size={11} />
                                    Due {dueDate.fromNow()}
                                </span>
                            )}
                            {assignment._count !== undefined && (
                                <span>{assignment._count.submissions} submissions</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function GradeCard({ grade }: { grade: Grade }) {
    return (
        <Card className="gap-0 py-0 overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-center gap-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm border', gradeColor(grade.grade))}>
                        {grade.grade}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {grade.assignment?.title || 'Assignment'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            {grade.assignment?.course && (
                                <span>{grade.assignment.course.name}</span>
                            )}
                            <span>·</span>
                            <span>Graded by {grade.gradedBy}</span>
                            <span>·</span>
                            <span>{dayjs(grade.gradedAt).fromNow()}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
