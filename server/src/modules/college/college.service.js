import prisma from '../../utils/prisma.js';

// Create college
export const createCollegeRecord = async (data) => {
    const { address, ...rest } = data;
    return await prisma.college.create({
        data: {
            ...rest,
            ...(address && {
                address: {
                    create: address
                }
            })
        },
        include: { address: true }
    });
};

// Get all colleges with pagination
export const getAllColleges = async (skip = 0, take = 20) => {
    const [colleges, total] = await prisma.$transaction([
        prisma.college.findMany({
            skip,
            take,
            include: { address: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.college.count()
    ]);
    return { colleges, total };
};

// Get college by ID
export const getCollegeById = async (id) => {
    const [college, studentCount, teacherCount] = await prisma.$transaction([
        prisma.college.findUnique({
            where: { id },
            include: {
                address: true,
                users: {
                    where: { type: 'admin' },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        userDetails: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        }),
        prisma.user.count({ where: { collegeId: id, type: 'student' } }),
        prisma.user.count({ where: { collegeId: id, type: 'teacher' } }),
    ]);

    if (!college) return null;

    return {
        ...college,
        _count: {
            students: studentCount,
            teachers: teacherCount,
            admins: college.users.length
        }
    };
};


// Update college
export const updateCollegeRecord = async (id, data) => {
    const { address, ...rest } = data;
    
    return await prisma.college.update({
        where: { id },
        data: {
            ...rest,
            ...(address && {
                address: {
                    upsert: {
                        create: address,
                        update: address
                    }
                }
            })
        },
        include: { address: true }
    });
};

// Delete college (Manual cascade to clean up all institutional data)
export const deleteCollegeRecord = async (id) => {
    const collegeId = parseInt(id);

    return await prisma.$transaction(async (tx) => {
        // 1. Fetch all users belonging to this college
        const users = await tx.user.findMany({
            where: { collegeId },
            select: { id: true }
        });
        const userIds = users.map(u => u.id);

        // 2. Fetch all courses belonging to this college
        const courses = await tx.course.findMany({
            where: { collegeId },
            select: { id: true }
        });
        const courseIds = courses.map(c => c.id);

        // 3. Fetch all assignments for these courses
        const assignments = await tx.assignment.findMany({
            where: { courseId: { in: courseIds } },
            select: { id: true }
        });
        const assignmentIds = assignments.map(a => a.id);

        // 4. Start cleaning up from the most dependent tables up
        
        // --- Academic Cleanup ---
        if (assignmentIds.length > 0) {
            await tx.submission.deleteMany({ where: { assignmentId: { in: assignmentIds } } });
            await tx.grade.deleteMany({ where: { assignmentId: { in: assignmentIds } } });
        }
        if (courseIds.length > 0) {
            await tx.assignment.deleteMany({ where: { courseId: { in: courseIds } } });
            await tx.enrollment.deleteMany({ where: { courseId: { in: courseIds } } });
            await tx.assessment.deleteMany({ where: { courseId: { in: courseIds } } }); // Results cascade from schema
        }

        // --- Market Cleanup for College Users ---
        if (userIds.length > 0) {
            await tx.orderItem.deleteMany({ 
                where: { 
                    OR: [
                        { order: { userId: { in: userIds } } },
                        { product: { creatorId: { in: userIds } } }
                    ]
                } 
            });
            await tx.order.deleteMany({ where: { userId: { in: userIds } } });
            await tx.cart.deleteMany({ where: { userId: { in: userIds } } });
            await tx.library.deleteMany({ where: { userId: { in: userIds } } });
            await tx.review.deleteMany({ where: { userId: { in: userIds } } });
            await tx.product.deleteMany({ where: { creatorId: { in: userIds } } });
        }

        // --- User Engagement & Social ---
        if (userIds.length > 0) {
            await tx.attendance.deleteMany({ where: { userId: { in: userIds } } });
            await tx.streak.deleteMany({ where: { userId: { in: userIds } } });
            await tx.notification.deleteMany({ where: { userId: { in: userIds } } });
            await tx.suggestion.deleteMany({ where: { userId: { in: userIds } } });
            await tx.chatMessage.deleteMany({ where: { userId: { in: userIds } } });
            await tx.userPreference.deleteMany({ where: { userId: { in: userIds } } });
            await tx.userAchievements.deleteMany({ where: { userId: { in: userIds } } });
            await tx.xp.deleteMany({ where: { userId: { in: userIds } } });
            await tx.wallet.deleteMany({ where: { userId: { in: userIds } } });
            await tx.auditLog.deleteMany({ where: { userId: { in: userIds } } });
            await tx.acknowledged.deleteMany({ where: { userId: { in: userIds } } });
            await tx.userDetails.deleteMany({ where: { userId: { in: userIds } } });
        }

        // --- Institutional Entities ---
        await tx.announcement.deleteMany({ where: { collegeId } });
        await tx.event.deleteMany({ where: { collegeId } });
        await tx.course.deleteMany({ where: { collegeId } });
        await tx.role.deleteMany({ where: { collegeId } });
        
        // 5. Delete Users
        if (userIds.length > 0) {
            await tx.user.deleteMany({ where: { collegeId } });
        }

        // 6. Finally delete the College
        return await tx.college.delete({
            where: { id: collegeId }
        });
    });
};
