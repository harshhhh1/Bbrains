import prisma from '../../../utils/prisma.js';
import { sendSuccess, sendError } from '../../../utils/response.js';
import {
    feeNoteKeywords,
    salaryNoteKeywords,
    buildTransactionSignalFilters,
    firstDefinedConfig,
    formatAddress,
} from '../helpers.js';

export const getAdminOverview = async (req, res) => {
    try {
        const adminId = String(req.user.id);
        const collegeId = req.user.collegeId ? Number(req.user.collegeId) : null;

        if (!collegeId) {
            return sendError(res, 'College ID is required', 400);
        }

        const adminUser = await prisma.user.findUnique({
            where: { id: adminId },
            select: {
                id: true,
                username: true,
                email: true,
                type: true,
                createdAt: true,
                college: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        regNo: true,
                        createdAt: true,
                        address: true,
                    },
                },
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        phone: true,
                        bio: true,
                    },
                },
                wallet: {
                    select: {
                        balance: true,
                    },
                },
                roles: {
                    select: {
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const students = await prisma.user.findMany({
            where: {
                type: 'student',
                collegeId
            },
            select: {
                id: true,
                wallet: {
                    select: {
                        balance: true,
                    },
                },
                userDetails: {
                    select: {
                        sex: true,
                    },
                },
            },
        });

        const teachersCount = await prisma.user.count({ where: { type: 'teacher', collegeId } });
        const staffCount = await prisma.user.count({ where: { type: 'staff', collegeId } });

        const roleCounts = await prisma.role.findMany({
            where: { collegeId },
            select: {
                name: true,
                _count: {
                    select: {
                        users: {
                            where: { user: { collegeId } }
                        },
                    },
                },
            },
        });

        const configs = await prisma.systemConfig.findMany();

        const courses = await prisma.course.findMany({
            where: { college: { id: collegeId } },
            select: {
                feePerStudent: true,
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        const feeTaggedCredits = await prisma.transactionHistory.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                user: { collegeId },
                type: 'credit',
                status: 'success',
                OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
            },
        });

        const latestTransactions = await prisma.transactionHistory.findMany({
            where: {
                user: { collegeId },
                status: 'success',
                OR: [
                    { category: 'fee', type: 'credit' },
                    { category: 'salary', type: 'debit' },
                ],
            },
            select: {
                amount: true,
                type: true,
                transactionDate: true,
                note: true,
            },
            orderBy: { transactionDate: 'desc' },
            take: 5,
        });

        const announcements = await prisma.announcement.findMany({
            where: { collegeId },
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                user: {
                    select: {
                        username: true,
                        userDetails: {
                            select: {
                                firstName: true,
                                lastName: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            date.setDate(1);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setMonth(nextDate.getMonth() + 1);
            last12Months.push({ date, nextDate });
        }

        const [revenueTrend, salaryTrend] = await Promise.all([
            Promise.all(last12Months.map(async ({ date, nextDate }) => {
                const aggregate = await prisma.transactionHistory.aggregate({
                    _sum: { amount: true },
                    where: {
                        user: { collegeId },
                        type: 'credit',
                        status: 'success',
                        transactionDate: { gte: date, lt: nextDate }
                    }
                });
                return {
                    date: date.toLocaleDateString('en-IN', { month: 'short' }),
                    amount: Number(aggregate._sum.amount || 0)
                };
            })),
            Promise.all(last12Months.map(async ({ date, nextDate }) => {
                const aggregate = await prisma.transactionHistory.aggregate({
                    _sum: { amount: true },
                    where: {
                        user: { collegeId },
                        type: 'debit',
                        status: 'success',
                        OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                        transactionDate: { gte: date, lt: nextDate }
                    }
                });
                return {
                    date: date.toLocaleDateString('en-IN', { month: 'short' }),
                    amount: Number(aggregate._sum.amount || 0)
                };
            }))
        ]);

        const auditLogs = await prisma.auditLog.findMany({
            where: {
                user: { collegeId },
            },
            select: {
                id: true,
                action: true,
                category: true,
                entity: true,
                entityId: true,
                userId: true,
                createdAt: true,
                user: {
                    select: {
                        username: true,
                        userDetails: {
                            select: {
                                firstName: true,
                                lastName: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const coursesList = await prisma.course.findMany({
            where: { college: { id: collegeId } },
            select: {
                id: true,
                name: true,
                standard: true,
            },
        });

        if (!adminUser) {
            return sendError(res, 'Admin user not found', 404);
        }

        const configMap = new Map(configs.map((config) => [config.key, config]));

        const studentsCount = students.length;
        const boysCount = students.filter((student) => student.userDetails?.sex === 'male').length;
        const girlsCount = students.filter((student) => student.userDetails?.sex === 'female').length;
        const otherStudentsCount = Math.max(studentsCount - boysCount - girlsCount, 0);

        const managerCount = roleCounts
            .filter((role) => role.name.toLowerCase().includes('manager'))
            .reduce((sum, role) => sum + role._count.users, 0);

        const otherStaffCount = Math.max(staffCount - managerCount, 0);
        const studentToTeacherRatio = teachersCount > 0
            ? Number((studentsCount / teachersCount).toFixed(1))
            : null;

        const receivedIncomeKeys = ['receivedIncome', 'totalReceivedIncome', 'feesReceived', 'totalFeesReceived'];
        const configuredReceivedIncome = Number(firstDefinedConfig(configMap, receivedIncomeKeys, 0) || 0);
        const transactionReceivedIncome = Number(feeTaggedCredits._sum.amount || 0);
        const receivedIncome = configuredReceivedIncome || transactionReceivedIncome;

        const accruedIncome = courses.reduce((sum, course) => {
            const classFee = Number(course.feePerStudent || 0);
            const enrolledStudents = Number(course._count?.enrollments || 0);
            return sum + (classFee * enrolledStudents);
        }, 0);

        const receivableIncome = Math.max(accruedIncome - receivedIncome, 0);
        const currencyKeys = ['currency', 'Currency', 'CURRENCY'];
        const currency = String(firstDefinedConfig(configMap, currencyKeys, 'INR') || 'INR');

        const currentRoles = adminUser.roles
            .map((entry) => entry.role?.name)
            .filter(Boolean);

        return sendSuccess(res, {
            people: {
                teachers: teachersCount,
                managers: managerCount,
                staff: otherStaffCount,
                students: studentsCount,
                studentToTeacherRatio,
                roleDistribution: roleCounts.map(rc => ({
                    role: rc.name,
                    count: rc._count.users
                }))
            },
            students: {
                total: studentsCount,
                boys: boysCount,
                girls: girlsCount,
                others: otherStudentsCount,
            },
            finance: {
                currency,
                feePerStudent: 0,
                receivedIncome,
                accruedIncome,
                receivableIncome,
                revenueTrend,
                salaryTrend,
                receivedSource: configuredReceivedIncome > 0 ? 'config' : 'transactions',
                accruedSource: courses.some((course) => Number(course.feePerStudent || 0) > 0) ? 'classes' : 'unavailable',
                latestTransactions: latestTransactions.map((transaction) => ({
                    amount: Number(transaction.amount || 0),
                    type: transaction.type,
                    transactionDate: transaction.transactionDate,
                    note: transaction.note || '',
                })),
            },
            admin: {
                id: adminUser.id,
                username: adminUser.username,
                email: adminUser.email,
                type: adminUser.type,
                createdAt: adminUser.createdAt,
                avatar: adminUser.userDetails?.avatar || null,
                firstName: adminUser.userDetails?.firstName || '',
                lastName: adminUser.userDetails?.lastName || '',
                displayName: adminUser.userDetails?.displayName || '',
                phone: adminUser.userDetails?.phone || '',
                bio: adminUser.userDetails?.bio || '',
                walletBalance: Number(adminUser.wallet?.balance || 0),
                roles: currentRoles,
            },
            institution: adminUser.college
                ? {
                    id: adminUser.college.id,
                    name: adminUser.college.name,
                    email: adminUser.college.email,
                    regNo: adminUser.college.regNo,
                    createdAt: adminUser.college.createdAt,
                    address: formatAddress(adminUser.college.address),
                }
                : null,
            announcements: announcements.map((ann) => ({
                id: ann.id,
                title: ann.title,
                content: ann.description,
                createdAt: ann.createdAt,
                createdBy: ann.user,
            })),
            auditLogs: auditLogs.map((log) => ({
                id: log.id,
                action: log.action,
                category: log.category,
                entityType: log.entity,
                entityId: log.entityId || '',
                userId: log.userId,
                createdAt: log.createdAt,
                user: log.user,
            })),
            recentAttendance: [],
            courses: coursesList.map((course) => ({
                id: course.id,
                name: course.name,
                standard: course.standard || '',
            })),
        });
    } catch (error) {
        console.error('Admin Overview error details:', {
            message: error.message,
            stack: error.stack,
            collegeId: req.user?.collegeId,
            adminId: req.user?.id
        });
        return sendError(res, 'Failed to fetch admin overview', 500);
    }
};