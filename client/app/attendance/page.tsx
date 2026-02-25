"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getCourses, getCourseEnrollments } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DataTable from '@/app/dashboard/components/DataTable'
import { CalendarCheck, Users } from 'lucide-react'

interface Course {
    id: number
    name: string
}

interface Enrollment {
    id: number
    userId: string
    courseId: number
    enrolledAt: string
    user?: { username: string; userDetails?: { firstName?: string; lastName?: string } }
}

export default function AttendancePage() {
    const { user, isLoading: authLoading } = useAuth()
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(true)
    const [enrollLoading, setEnrollLoading] = useState(false)

    const canAccess = user?.type === 'teacher' || user?.type === 'admin'

    useEffect(() => {
        if (authLoading) return
        if (!canAccess) {
            setLoading(false)
            return
        }
        getCourses()
            .then((data) => setCourses(Array.isArray(data) ? data : []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false))
    }, [authLoading, canAccess])

    useEffect(() => {
        if (!selectedCourseId) return
        setEnrollLoading(true)
        getCourseEnrollments(parseInt(selectedCourseId))
            .then((data) => setEnrollments(Array.isArray(data) ? data : []))
            .catch(() => setEnrollments([]))
            .finally(() => setEnrollLoading(false))
    }, [selectedCourseId])

    if (!authLoading && !canAccess) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <p className="text-sm">Access restricted to teachers and admins</p>
            </div>
        )
    }

    const columns = [
        {
            key: 'name',
            header: 'Student',
            render: (row: Enrollment) => {
                const details = row.user?.userDetails
                return details?.firstName
                    ? `${details.firstName} ${details.lastName || ''}`
                    : row.user?.username || '—'
            }
        },
        { key: 'username', header: 'Username', render: (row: Enrollment) => `@${row.user?.username || '—'}` },
        {
            key: 'enrolledAt',
            header: 'Enrolled',
            render: (row: Enrollment) => new Date(row.enrolledAt).toLocaleDateString()
        },
    ]

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <CalendarCheck size={20} className="text-teal-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-sm text-gray-500">View course enrollments by class</p>
                </div>
            </div>

            {loading ? (
                <Skeleton className="h-12 w-64 rounded-lg" />
            ) : (
                <div className="flex items-center gap-4">
                    <div className="w-64">
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCourseId && !enrollLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users size={16} />
                            <span>{enrollments.length} enrolled</span>
                        </div>
                    )}
                </div>
            )}

            {selectedCourseId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold text-gray-800">
                            Enrolled Students — {courses.find((c) => String(c.id) === selectedCourseId)?.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        {enrollLoading ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={enrollments}
                                emptyMessage="No students enrolled in this course"
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            {!selectedCourseId && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                    <CalendarCheck size={40} strokeWidth={1.5} />
                    <p className="text-sm">Select a course to view enrollment</p>
                </div>
            )}
        </div>
    )
}
