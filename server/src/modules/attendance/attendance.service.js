import prisma from '../../utils/prisma.js';
import { createNotification } from '../notification/notification.service.js';
import { awardXpToUser, deductXpFromUser } from '../xp/xp.service.js';
import { awardCoinsToUser, deductCoinsFromUser } from '../wallet/wallet.service.js';
import { ForbiddenError } from '../../utils/errors.js';

const ATTENDANCE_REWARD_XP = 50;
const ATTENDANCE_REWARD_COINS = 100;
const ATTENDANCE_REWARD_REASON = 'Daily attendance reward';

const normalizeDate = (value) => {
    const dt = new Date(value);
    return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
};

const hasManagerPrivileges = (currentUser) => {
    if (!currentUser) return false;
    if (currentUser.type === 'superadmin' || currentUser.originalType === 'superadmin') return true;
    if (currentUser.type === 'admin' || currentUser.type === 'manager') return true;

    return (currentUser.roles || []).some((entry) =>
        entry?.role?.name?.toLowerCase().includes('manager')
    );
};

const getTeacherAttendanceScope = async (currentUser) => {
    if (!currentUser || currentUser.type !== 'teacher' || hasManagerPrivileges(currentUser)) {
        return null;
    }

    const assignedCourse = await prisma.course.findUnique({
        where: { classTeacherId: currentUser.id },
        select: {
            id: true,
            name: true,
            standard: true,
        },
    });

    if (!assignedCourse) {
        return {
            assignedCourse: null,
            studentIds: [],
        };
    }

    const enrollments = await prisma.enrollment.findMany({
        where: { courseId: assignedCourse.id },
        select: { userId: true },
    });

    return {
        assignedCourse,
        studentIds: enrollments.map((enrollment) => enrollment.userId),
    };
};

const assertTeacherCanManageAttendanceForStudents = async (studentIds, currentUser) => {
    const scope = await getTeacherAttendanceScope(currentUser);
    if (!scope) return null;

    if (!scope.assignedCourse) {
        throw new ForbiddenError('No class is assigned to you as class teacher');
    }

    const allowedStudentIds = new Set(scope.studentIds);
    const requestedStudentIds = Array.from(
        new Set((studentIds || []).map((id) => String(id ?? '').trim()).filter(Boolean))
    );

    if (requestedStudentIds.some((studentId) => !allowedStudentIds.has(studentId))) {
        throw new ForbiddenError('You can only manage attendance for students in your assigned class');
    }

    return scope;
};

export const getAttendanceRecords = async (userId, startDate, endDate) => {
    return await prisma.attendance.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            date: 'asc',
        },
    });
};

export const getAttendanceByFilters = async (filters, currentUser = null) => {
    const { userId, studentId, startDate, endDate, status } = filters;
    const where = {};

    if (userId || studentId) {
        where.userId = userId || studentId;
    }

    if (studentId) {
        await assertTeacherCanManageAttendanceForStudents([studentId], currentUser);
    }

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    if (status) {
        where.status = status;
    }

    return await prisma.attendance.findMany({
        where,
        include: {
            marker: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            date: 'desc',
        },
    });
};

export const getAttendanceForDate = async (date, currentUser = null) => {
    const normalizedDate = normalizeDate(date);
    const where = {
        date: normalizedDate,
    };
    const scope = await getTeacherAttendanceScope(currentUser);

    if (scope) {
        if (!scope.assignedCourse || scope.studentIds.length === 0) {
            return [];
        }

        where.userId = {
            in: scope.studentIds,
        };
    } else if (currentUser?.type === 'student') {
        // Students can only see their own attendance
        where.userId = currentUser.id;
    } else if (!hasManagerPrivileges(currentUser)) {
        // If not a manager/admin and not a teacher with scope, allow nothing
        return [];
    }

    return await prisma.attendance.findMany({
        where,
        include: {
            marker: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const markAttendanceForStudent = async (studentId, date, status, markedBy, notes, currentUser = null) => {
    await assertTeacherCanManageAttendanceForStudents([studentId], currentUser);
    const dt = normalizeDate(date);

    // Use upsert to simplify
    const existing = await prisma.attendance.findFirst({
        where: { userId: studentId, date: dt }
    });

    const result = existing 
        ? await prisma.attendance.update({
            where: { id: existing.id },
            data: { status, markedBy, notes }
          })
        : await prisma.attendance.create({
            data: {
                userId: studentId,
                date: dt,
                status,
                markedBy,
                notes
            }
          });

    // Notify student
    const dateStr = dt.toLocaleDateString();
    await createNotification(
        studentId,
        'Attendance Marked',
        `Your attendance for ${dateStr} has been marked as ${status}.`,
        'attendance',
        result.id.toString()
    );

    // Award XP and coins reward for present status
    const wasPresent = existing?.status === 'present';
    if (status === 'present' && !wasPresent) {
        const existingReward = await prisma.transactionHistory.findFirst({
            where: {
                userId: studentId,
                note: { contains: ATTENDANCE_REWARD_REASON },
                createdAt: {
                    gte: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
                }
            }
        });

        if (!existingReward) {
            await awardXpToUser(studentId, ATTENDANCE_REWARD_XP);
            await awardCoinsToUser(studentId, ATTENDANCE_REWARD_COINS, ATTENDANCE_REWARD_REASON);
        }
    }

    // Remove reward if marked absent after being present
    if (wasPresent && status !== 'present') {
        const existingReward = await prisma.transactionHistory.findFirst({
            where: {
                userId: studentId,
                note: { contains: ATTENDANCE_REWARD_REASON },
                createdAt: {
                    gte: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
                }
            }
        });

        if (existingReward) {
            await deductXpFromUser(studentId, ATTENDANCE_REWARD_XP);
            await deductCoinsFromUser(studentId, ATTENDANCE_REWARD_COINS, 'Attendance marked absent');
        }
    }

    return result;
};

export const markAttendanceForStudents = async (studentIds, date, status, markedBy, currentUser = null) => {
    const dt = normalizeDate(date);

    const ids = Array.from(new Set((studentIds || []).map((id) => String(id).trim()).filter(Boolean)));
    if (ids.length === 0) return [];

    await assertTeacherCanManageAttendanceForStudents(ids, currentUser);

    const existingRecords = await prisma.attendance.findMany({
        where: {
            userId: { in: ids },
            date: dt,
        },
        select: {
            id: true,
            userId: true,
        },
    });

    const existingByUserId = new Map(existingRecords.map((record) => [record.userId, record]));

    const results = await prisma.$transaction(
        ids.map((studentId) => {
            const existing = existingByUserId.get(studentId);

            if (existing) {
                return prisma.attendance.update({
                    where: { id: existing.id },
                    data: {
                        status,
                        markedBy,
                    },
                });
            }

            return prisma.attendance.create({
                data: {
                    userId: studentId,
                    date: dt,
                    status,
                    markedBy,
                },
            });
        })
    );

    const dateStr = dt.toLocaleDateString();
    await Promise.all(
        ids.map((studentId) =>
            createNotification(
                studentId,
                'Attendance Marked',
                `Your attendance for ${dateStr} has been marked as ${status}.`,
                'attendance'
            )
        )
    );

    // Award XP and coins rewards for present status
    if (status === 'present') {
        for (const studentId of ids) {
            const wasPresent = existingByUserId.get(studentId)?.status === 'present';
            if (!wasPresent) {
                const existingReward = await prisma.transactionHistory.findFirst({
                    where: {
                        userId: studentId,
                        note: { contains: ATTENDANCE_REWARD_REASON },
                        createdAt: {
                            gte: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
                        }
                    }
                });

                if (!existingReward) {
                    await awardXpToUser(studentId, ATTENDANCE_REWARD_XP);
                    await awardCoinsToUser(studentId, ATTENDANCE_REWARD_COINS, ATTENDANCE_REWARD_REASON);
                }
            }
        }
    }

    // Remove rewards if marked absent after being present
    if (status !== 'present') {
        for (const studentId of ids) {
            const wasPresent = existingByUserId.get(studentId)?.status === 'present';
            if (wasPresent) {
                const existingReward = await prisma.transactionHistory.findFirst({
                    where: {
                        userId: studentId,
                        note: { contains: ATTENDANCE_REWARD_REASON },
                        createdAt: {
                            gte: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
                        }
                    }
                });

                if (existingReward) {
                    await deductXpFromUser(studentId, ATTENDANCE_REWARD_XP);
                    await deductCoinsFromUser(studentId, ATTENDANCE_REWARD_COINS, 'Attendance marked absent');
                }
            }
        }
    }

    return results;
};
