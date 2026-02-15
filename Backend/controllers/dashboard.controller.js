import prisma from '../utils/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

// GET /dashboard
export const getDashboard = async (req, res) => {
    try {
        const { id, type } = req.user;

        switch (type) {
            case 'student':
                return await studentDashboard(id, res);
            case 'teacher':
                return await teacherDashboard(id, res);
            case 'admin':
                return await adminDashboard(res);
            default:
                return await studentDashboard(id, res);
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        return sendError(res, 'Failed to fetch dashboard', 500);
    }
};

async function studentDashboard(userId, res) {
    const [user, enrollments, xp, achievements, wallet, recentGrades, leaderboardPos] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, username: true, email: true, type: true,
                userDetails: true
            }
        }),
        prisma.enrollment.findMany({
            where: { userId },
            include: { course: { select: { name: true, id: true } } }
        }),
        prisma.xp.findUnique({ where: { userId } }),
        prisma.userAchievements.findMany({
            where: { userId },
            include: { achievement: true },
            take: 5,
            orderBy: { unlockedAt: 'desc' }
        }),
        prisma.wallet.findUnique({
            where: { userId },
            select: { balance: true }
        }),
        prisma.grade.findMany({
            where: { userId },
            include: { assignment: { select: { title: true } } },
            take: 5,
            orderBy: { gradedAt: 'desc' }
        }),
        prisma.leaderboard.findFirst({
            where: { userId, category: 'allTime' },
            select: { rank: true, score: true }
        })
    ]);

    return sendSuccess(res, {
        user,
        stats: {
            totalCourses: enrollments.length,
            xp: xp?.xp || 0,
            level: xp?.level || 1,
            walletBalance: wallet?.balance || 0,
            leaderboardRank: leaderboardPos?.rank || null,
            totalAchievements: achievements.length
        },
        enrollments,
        recentGrades,
        recentAchievements: achievements
    });
}

async function teacherDashboard(userId, res) {
    const [user, totalStudents, totalCourses, recentSubmissions, pendingGrades] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, type: true, userDetails: true }
        }),
        prisma.user.count({ where: { type: 'student' } }),
        prisma.course.count(),
        prisma.submission.findMany({
            include: {
                user: { select: { username: true } },
                assignment: { select: { title: true } }
            },
            take: 10,
            orderBy: { submittedAt: 'desc' }
        }),
        prisma.submission.count({
            where: {
                grade: { none: {} }
            }
        })
    ]);

    return sendSuccess(res, {
        user,
        stats: {
            totalStudents,
            totalCourses,
            pendingGrades
        },
        recentSubmissions
    });
}

async function adminDashboard(res) {
    const [totalUsers, totalStudents, totalTeachers, totalCourses, totalProducts, totalOrders, recentLogs, systemStats] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { type: 'student' } }),
        prisma.user.count({ where: { type: 'teacher' } }),
        prisma.course.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true } } }
        }),
        prisma.wallet.aggregate({
            _sum: { balance: true },
            _count: { _all: true }
        })
    ]);

    return sendSuccess(res, {
        stats: {
            totalUsers,
            totalStudents,
            totalTeachers,
            totalCourses,
            totalProducts,
            totalOrders,
            totalWallets: systemStats._count._all,
            totalWalletBalance: systemStats._sum.balance || 0
        },
        recentLogs
    });
}