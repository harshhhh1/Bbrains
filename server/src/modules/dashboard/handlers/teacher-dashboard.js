import prisma from '../../../utils/prisma.js';
import { sendSuccess } from '../../../utils/response.js';

export const teacherDashboard = async (currentUser, res) => {
    try {
        const userId = currentUser.id;
        const collegeId = currentUser.collegeId;

        const [user, totalStudents, totalCourses, recentSubmissions, totalSubmissions, totalGrades, xp] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, email: true, type: true, userDetails: true }
            }),
            prisma.user.count({ where: { type: 'student', collegeId } }),
            prisma.course.count({ where: { college: { id: collegeId } } }),
            prisma.submission.findMany({
                where: {
                    user: { collegeId }
                },
                include: {
                    user: { select: { username: true } },
                    assignment: { select: { title: true } }
                },
                take: 10,
                orderBy: { submittedAt: 'desc' }
            }),
            prisma.submission.count({
                where: { user: { collegeId } }
            }),
            prisma.grade.count({
                where: { user: { collegeId } }
            }),
            prisma.xp.findUnique({ where: { userId } }),
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
                totalStudents,
                totalCourses,
                xp: Number(xp?.xp) || 0,
                level: xp?.level || 1,
                pendingGrades: totalSubmissions - totalGrades
            },
            recentSubmissions
        });
    } catch (error) {
        console.error('Teacher Dashboard error details:', error);
        throw error;
    }
};