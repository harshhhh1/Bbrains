import prisma from '../../../utils/prisma.js';
import { sendSuccess } from '../../../utils/response.js';

export const adminDashboard = async (currentUser, res) => {
    try {
        const userId = currentUser.id;
        const collegeId = currentUser.collegeId;

        const [user, totalUsers, totalStudents, totalTeachers, totalCourses, totalProducts, totalOrders, recentLogs, systemStats] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, email: true, type: true, userDetails: true }
            }),
            prisma.user.count({ where: { collegeId } }),
            prisma.user.count({ where: { type: 'student', collegeId } }),
            prisma.user.count({ where: { type: 'teacher', collegeId } }),
            prisma.course.count({ where: { college: { id: collegeId } } }),
            prisma.product.count({ where: { creator: { collegeId } } }),
            prisma.order.count({ where: { user: { collegeId } } }),
            prisma.auditLog.findMany({
                where: { user: { collegeId } },
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } }
            }),
            prisma.wallet.aggregate({
                _sum: { balance: true },
                _count: { _all: true },
                where: { user: { collegeId } }
            })
        ]);

        const userProfile = {
            ...user,
            avatar: user?.userDetails?.avatar,
            firstName: user?.userDetails?.firstName,
            lastName: user?.userDetails?.lastName,
        };

        return sendSuccess(res, {
            user: userProfile,
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalCourses,
                totalProducts,
                totalOrders,
                totalWallets: systemStats._count._all,
                totalWalletBalance: Number(systemStats._sum.balance) || 0
            },
            recentLogs
        });
    } catch (error) {
        console.error('Admin Dashboard error details:', error);
        throw error;
    }
};