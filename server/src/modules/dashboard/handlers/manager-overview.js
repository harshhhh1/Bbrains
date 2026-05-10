import prisma from '../../../utils/prisma.js';
import { sendSuccess, sendError } from '../../../utils/response.js';
import {
    feeNoteKeywords,
    salaryNoteKeywords,
    buildTransactionSignalFilters,
    firstDefinedConfig,
    getCustomRoleNames,
    formatAddress,
} from '../helpers.js';

export const getManagerOverview = async (req, res) => {
    try {
        const managerId = String(req.user.id);
        const collegeId = req.user.collegeId ? Number(req.user.collegeId) : null;
        const customRoleNames = await getCustomRoleNames(managerId);
        const hasManagerRole = customRoleNames.some((role) => role.toLowerCase().includes('manager'));

        if (req.user.type !== 'admin' && !hasManagerRole) {
            return sendError(res, 'Not authorized to access manager overview', 403);
        }

        const [
            managerUser,
            students,
            teachersCount,
            staffCount,
            totalCourses,
            configs,
            feeTaggedCredits,
            salaryTaggedDebits,
            anySalaryTransactions,
            ownTaggedCreditTotal,
            ownTaggedCreditCount,
            privilegedAttendanceRecords,
            latestPrivilegedAttendance,
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: managerId },
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
            }),
            prisma.user.findMany({
                where: {
                    type: 'student',
                    collegeId
                },
                select: {
                    id: true,
                    userDetails: {
                        select: {
                            sex: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where: { type: 'teacher', collegeId } }),
            prisma.user.count({ where: { type: 'staff', collegeId } }),
            prisma.course.count({ where: { college: { id: collegeId } } }),
            prisma.systemConfig.findMany(),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    user: { collegeId },
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
                },
            }),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    user: { collegeId },
                    type: 'debit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.transactionHistory.count({
                where: {
                    user: { collegeId },
                    type: 'debit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    userId: managerId,
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.transactionHistory.count({
                where: {
                    userId: managerId,
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.attendance.findMany({
                where: {
                    user: {
                        collegeId,
                        type: {
                            in: ['teacher', 'staff'],
                        },
                    },
                },
                select: {
                    status: true,
                    user: {
                        select: {
                            type: true,
                        },
                    },
                },
            }),
            prisma.attendance.findFirst({
                where: {
                    user: {
                        collegeId,
                        type: {
                            in: ['teacher', 'staff'],
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
                select: {
                    date: true,
                },
            }),
        ]);

        if (!managerUser) {
            return sendError(res, 'Manager user not found', 404);
        }

        const configMap = new Map(configs.map((config) => [config.key, config]));

        const studentsCount = students.length;
        const boysCount = students.filter((student) => student.userDetails?.sex === 'male').length;
        const girlsCount = students.filter((student) => student.userDetails?.sex === 'female').length;
        const otherStudentsCount = Math.max(studentsCount - boysCount - girlsCount, 0);

        const receivedIncomeKeys = ['receivedIncome', 'totalReceivedIncome', 'feesReceived', 'totalFeesReceived'];
        const configuredFeesReceived = Number(firstDefinedConfig(configMap, receivedIncomeKeys, 0) || 0);
        const transactionFeesReceived = Number(feeTaggedCredits._sum.amount || 0);
        const feesReceived = configuredFeesReceived || transactionFeesReceived || 0;
        const feesReceivedSource = configuredFeesReceived > 0
            ? 'config'
            : transactionFeesReceived > 0
                ? 'transactions'
                : 'unavailable';

        const salaryPaidKeys = ['salaryPaid', 'totalSalaryPaid', 'salariesPaid', 'totalSalariesPaid'];
        const configuredSalaryPaid = firstDefinedConfig(configMap, salaryPaidKeys, null);
        const salaryPaidFromConfig = configuredSalaryPaid !== null && configuredSalaryPaid !== undefined && configuredSalaryPaid !== ''
            ? Number(configuredSalaryPaid)
            : null;
        const salaryPaidFromTransactions = anySalaryTransactions > 0
            ? Number(salaryTaggedDebits._sum.amount || 0)
            : null;
        const salaryPaid = salaryPaidFromConfig ?? salaryPaidFromTransactions;
        const salaryPaidSource = salaryPaidFromConfig !== null
            ? 'config'
            : salaryPaidFromTransactions !== null
                ? 'transactions'
                : 'unavailable';

        const ownTaggedIncomeCount = ownTaggedCreditCount || 0;
        const ownIncomeReceived = ownTaggedIncomeCount > 0
            ? Number(ownTaggedCreditTotal._sum.amount || 0)
            : null;
        const ownIncomeSource = ownTaggedIncomeCount > 0
            ? 'tagged-transactions'
            : 'unavailable';

        const attendanceSummary = privilegedAttendanceRecords.reduce((summary, record) => {
            summary.totalRecords += 1;

            if (record.status === 'present') summary.present += 1;
            if (record.status === 'absent') summary.absent += 1;
            if (record.status === 'late') summary.late += 1;

            if (record.user?.type === 'teacher') summary.teacherRecords += 1;
            if (record.user?.type === 'staff') summary.staffRecords += 1;

            return summary;
        }, {
            totalRecords: 0,
            present: 0,
            absent: 0,
            late: 0,
            teacherRecords: 0,
            staffRecords: 0,
        });

        const currencyKeys = ['currency', 'Currency', 'CURRENCY'];
        const currency = String(firstDefinedConfig(configMap, currencyKeys, 'INR') || 'INR');
        const currentRoles = managerUser.roles
            .map((entry) => entry.role?.name)
            .filter(Boolean);

        return sendSuccess(res, {
            people: {
                teachers: teachersCount,
                otherStaff: staffCount,
                totalStaff: teachersCount + staffCount,
                classes: totalCourses,
                students: studentsCount,
                boys: boysCount,
                girls: girlsCount,
                others: otherStudentsCount,
            },
            finance: {
                currency,
                feesReceived,
                feesReceivedSource,
                salaryPaid,
                salaryPaidSource,
            },
            attendance: {
                ...attendanceSummary,
                latestMarkedAt: latestPrivilegedAttendance?.date || null,
                source: attendanceSummary.totalRecords > 0 ? 'records' : 'unavailable',
            },
            manager: {
                id: managerUser.id,
                username: managerUser.username,
                email: managerUser.email,
                type: managerUser.type,
                createdAt: managerUser.createdAt,
                avatar: managerUser.userDetails?.avatar || null,
                firstName: managerUser.userDetails?.firstName || '',
                lastName: managerUser.userDetails?.lastName || '',
                displayName: managerUser.userDetails?.displayName || '',
                phone: managerUser.userDetails?.phone || '',
                bio: managerUser.userDetails?.bio || '',
                walletBalance: Number(managerUser.wallet?.balance || 0),
                ownIncomeReceived,
                ownIncomeSource,
                roles: currentRoles,
            },
            institution: managerUser.college
                ? {
                    id: managerUser.college.id,
                    name: managerUser.college.name,
                    email: managerUser.college.email,
                    regNo: managerUser.college.regNo,
                    createdAt: managerUser.college.createdAt,
                    address: formatAddress(managerUser.college.address),
                }
                : null,
        });
    } catch (error) {
        console.error('Manager Overview error details:', error);
        return sendError(res, 'Failed to fetch manager overview', 500);
    }
};