"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getDashboard, getLeaderboard } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import WelcomeBanner from './components/WelcomeBanner'
import StatsCard from './components/StatsCard'
import XPProgressChart from './components/XPProgressChart'
import GradeDistributionChart from './components/GradeDistributionChart'
import RecentActivityFeed from './components/RecentActivityFeed'
import LeaderboardPreview from './components/LeaderboardPreview'
import QuickActions from './components/QuickActions'
import DataTable from './components/DataTable'
import {
    BookOpen, Zap, Wallet, Trophy, Star, Users, GraduationCap,
    ClipboardList, Megaphone, MessageSquare, Receipt, Activity
} from 'lucide-react'

function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-56 rounded-xl" />
                <Skeleton className="h-56 rounded-xl" />
            </div>
        </div>
    )
}

function StudentDashboard({ data, leaderboard, userId }: { data: any; leaderboard: any[]; userId: string }) {
    const { user, stats, recentGrades, recentAchievements, announcements, enrollments } = data

    const displayName = user?.userDetails?.firstName
        ? `${user.userDetails.firstName} ${user.userDetails.lastName || ''}`
        : user?.username || 'Student'
    const avatarUrl = user?.userDetails?.avatar || null

    const gradeActivity = (recentGrades || []).map((g: any) => ({
        id: g.id,
        label: g.assignment?.title || 'Assignment',
        sublabel: `Grade: ${g.grade}`,
        date: g.gradedAt,
        dotColor: 'bg-green-400',
    }))

    const achievementActivity = (recentAchievements || []).map((a: any) => ({
        id: a.id,
        label: a.achievement?.name || 'Achievement',
        sublabel: a.achievement?.description,
        date: a.unlockedAt,
        dotColor: 'bg-yellow-400',
    }))

    const announcementActivity = (announcements || []).map((a: any) => ({
        id: a.id,
        label: a.title,
        sublabel: a.content?.slice(0, 60),
        date: a.createdAt,
        dotColor: 'bg-blue-400',
    }))

    const studentActions = [
        { label: 'Announcements', href: '/announcements', icon: <Megaphone size={20} /> },
        { label: 'Assignments', href: '/exams', icon: <ClipboardList size={20} /> },
        { label: 'Wallet', href: '/wallet', icon: <Wallet size={20} /> },
        { label: 'Chat', href: '/dashboard/chat', icon: <MessageSquare size={20} /> },
        { label: 'Payments', href: '/payment-history', icon: <Receipt size={20} /> },
        { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy size={20} /> },
    ]

    return (
        <div className="p-6 space-y-6">
            <WelcomeBanner name={displayName} role="Student" avatarUrl={avatarUrl} />

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatsCard
                    label="Courses"
                    value={stats.totalCourses}
                    icon={<BookOpen size={20} />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <StatsCard
                    label="Total XP"
                    value={stats.xp}
                    icon={<Zap size={20} />}
                    iconBg="bg-yellow-50"
                    iconColor="text-yellow-600"
                />
                <StatsCard
                    label="Level"
                    value={stats.level}
                    icon={<Star size={20} />}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                />
                <StatsCard
                    label="Balance"
                    value={`₿${stats.walletBalance}`}
                    icon={<Wallet size={20} />}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                />
                <StatsCard
                    label="Rank"
                    value={stats.leaderboardRank ?? '—'}
                    icon={<Trophy size={20} />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-600"
                />
                <StatsCard
                    label="Achievements"
                    value={stats.totalAchievements}
                    icon={<Star size={20} />}
                    iconBg="bg-pink-50"
                    iconColor="text-pink-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <XPProgressChart xp={stats.xp} level={stats.level} />
                <GradeDistributionChart grades={recentGrades || []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <RecentActivityFeed
                    title="Recent Grades"
                    items={gradeActivity}
                    emptyMessage="No grades yet"
                />
                <RecentActivityFeed
                    title="Announcements"
                    items={announcementActivity}
                    emptyMessage="No announcements"
                />
                <RecentActivityFeed
                    title="Achievements"
                    items={achievementActivity}
                    emptyMessage="No achievements yet"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LeaderboardPreview entries={leaderboard} currentUserId={userId} />
                <QuickActions actions={studentActions} />
            </div>
        </div>
    )
}

function TeacherDashboard({ data }: { data: any }) {
    const { user, stats, recentSubmissions } = data

    const displayName = user?.userDetails?.firstName
        ? `${user.userDetails.firstName} ${user.userDetails.lastName || ''}`
        : user?.username || 'Teacher'
    const avatarUrl = user?.userDetails?.avatar || null

    const submissionColumns = [
        { key: 'username', header: 'Student', render: (row: any) => row.user?.username || '—' },
        { key: 'title', header: 'Assignment', render: (row: any) => row.assignment?.title || '—' },
        {
            key: 'submittedAt', header: 'Submitted', render: (row: any) =>
                new Date(row.submittedAt).toLocaleDateString()
        },
    ]

    const teacherActions = [
        { label: 'Announcements', href: '/announcements', icon: <Megaphone size={20} /> },
        { label: 'Assignments', href: '/exams', icon: <ClipboardList size={20} /> },
        { label: 'Attendance', href: '/attendance', icon: <Users size={20} /> },
        { label: 'Chat', href: '/dashboard/chat', icon: <MessageSquare size={20} /> },
        { label: 'Wallet', href: '/wallet', icon: <Wallet size={20} /> },
        { label: 'Payments', href: '/payment-history', icon: <Receipt size={20} /> },
    ]

    return (
        <div className="p-6 space-y-6">
            <WelcomeBanner name={displayName} role="Teacher" avatarUrl={avatarUrl} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard
                    label="Total Students"
                    value={stats.totalStudents}
                    icon={<Users size={20} />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <StatsCard
                    label="Total Courses"
                    value={stats.totalCourses}
                    icon={<GraduationCap size={20} />}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                />
                <StatsCard
                    label="Pending Grades"
                    value={stats.pendingGrades}
                    icon={<ClipboardList size={20} />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-600"
                    trend={stats.pendingGrades > 0 ? 'Needs attention' : 'All graded'}
                    trendUp={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800">Recent Submissions</h3>
                        </div>
                        <DataTable
                            columns={submissionColumns}
                            data={recentSubmissions || []}
                            emptyMessage="No submissions yet"
                        />
                    </div>
                </div>
                <QuickActions actions={teacherActions} />
            </div>
        </div>
    )
}

function AdminDashboard({ data }: { data: any }) {
    const { stats, recentLogs } = data

    const logColumns = [
        { key: 'username', header: 'User', render: (row: any) => row.user?.username || 'System' },
        { key: 'action', header: 'Action', render: (row: any) => `${row.category} / ${row.action}` },
        { key: 'entity', header: 'Entity', render: (row: any) => `${row.entity} #${row.entityId}` },
        {
            key: 'createdAt', header: 'Time', render: (row: any) =>
                new Date(row.createdAt).toLocaleString()
        },
    ]

    const adminActions = [
        { label: 'Users', href: '/admin/users', icon: <Users size={20} /> },
        { label: 'Courses', href: '/admin/courses', icon: <GraduationCap size={20} /> },
        { label: 'Announcements', href: '/announcements', icon: <Megaphone size={20} /> },
        { label: 'Logs', href: '/admin/logs', icon: <Activity size={20} /> },
        { label: 'Chat', href: '/dashboard/chat', icon: <MessageSquare size={20} /> },
        { label: 'Payments', href: '/payment-history', icon: <Receipt size={20} /> },
    ]

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-5 text-white">
                <h2 className="text-xl font-bold">Admin Dashboard</h2>
                <p className="text-gray-300 text-sm mt-1">System overview and management</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatsCard label="Total Users" value={stats.totalUsers} icon={<Users size={20} />} iconBg="bg-blue-50" iconColor="text-blue-600" />
                <StatsCard label="Students" value={stats.totalStudents} icon={<BookOpen size={20} />} iconBg="bg-green-50" iconColor="text-green-600" />
                <StatsCard label="Teachers" value={stats.totalTeachers} icon={<GraduationCap size={20} />} iconBg="bg-purple-50" iconColor="text-purple-600" />
                <StatsCard label="Courses" value={stats.totalCourses} icon={<BookOpen size={20} />} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatsCard label="Products" value={stats.totalProducts} icon={<Receipt size={20} />} iconBg="bg-orange-50" iconColor="text-orange-600" />
                <StatsCard label="Orders" value={stats.totalOrders} icon={<ClipboardList size={20} />} iconBg="bg-pink-50" iconColor="text-pink-600" />
                <StatsCard label="Wallets" value={stats.totalWallets} icon={<Wallet size={20} />} iconBg="bg-teal-50" iconColor="text-teal-600" />
                <StatsCard label="Total Balance" value={`₿${stats.totalWalletBalance}`} icon={<Wallet size={20} />} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800">Recent Audit Logs</h3>
                        </div>
                        <DataTable
                            columns={logColumns}
                            data={recentLogs || []}
                            emptyMessage="No logs"
                        />
                    </div>
                </div>
                <QuickActions actions={adminActions} />
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { user, isLoading: authLoading } = useAuth()
    const [dashData, setDashData] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        const load = async () => {
            try {
                const [dash, lb] = await Promise.all([
                    getDashboard(),
                    getLeaderboard('allTime').catch(() => []),
                ])
                setDashData(dash)
                setLeaderboard(Array.isArray(lb) ? lb : [])
            } catch {
                // handled gracefully
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [authLoading])

    if (authLoading || loading) return <DashboardSkeleton />
    if (!dashData) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            Failed to load dashboard
        </div>
    )

    const userType = user?.type || dashData?.user?.type || 'student'

    if (userType === 'admin') return <AdminDashboard data={dashData} />
    if (userType === 'teacher') return <TeacherDashboard data={dashData} />
    return <StudentDashboard data={dashData} leaderboard={leaderboard} userId={user?.id || dashData?.user?.id} />
}
