const findCourseInCollege = async (tx, courseId, collegeId, notFoundMessage) => {
    const course = await tx.course.findUnique({
        where: { id: Number(courseId) },
        select: {
            id: true,
            collegeId: true,
            classTeacherId: true,
        }
    });

    if (!course || Number(course.collegeId ?? 0) !== Number(collegeId)) {
        throw new Error(notFoundMessage);
    }

    return course;
};

const ensureRoleByNameInternal = async (tx, roleName, description, collegeId) => {
    const role = await tx.role.findFirst({
        where: {
            name: { equals: roleName, mode: 'insensitive' },
            OR: [
                { collegeId: collegeId },
                { collegeId: null }
            ]
        },
        orderBy: { collegeId: 'asc' }
    });

    if (role) return { role, isNew: false };

    const newRole = await tx.role.create({
        data: {
            name: roleName,
            description: description || `${roleName} role`,
            collegeId: collegeId,
            isSystem: false,
            isDefault: false
        }
    });

    return { role: newRole, isNew: true };
};

const grantStudentPermissionsToRole = async (tx, roleId) => {
    const studentRole = await tx.role.findFirst({
        where: { name: { equals: 'Student', mode: 'insensitive' }, collegeId: null }
    });

    if (!studentRole) return;

    const studentPerms = await tx.rolePermission.findMany({
        where: { roleId: studentRole.id, enabled: true }
    });

    for (const sp of studentPerms) {
        await tx.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: roleId,
                    permissionId: sp.permissionId
                }
            },
            create: {
                roleId: roleId,
                permissionId: sp.permissionId,
                enabled: true
            },
            update: { enabled: true }
        });
    }
};

const syncTeacherClassTeacherAssignment = async (tx, teacherId, nextCourseId, collegeId) => {
    await tx.course.updateMany({
        where: { classTeacherId: teacherId },
        data: { classTeacherId: null }
    });

    if (!nextCourseId) return;

    const course = await findCourseInCollege(tx, nextCourseId, collegeId, 'Selected class was not found for this college');

    if (course.classTeacherId && course.classTeacherId !== teacherId) {
        throw new Error('This class already has a class teacher assigned');
    }

    await tx.course.update({
        where: { id: course.id },
        data: {
            classTeacherId: teacherId,
        }
    });
};

export {
    findCourseInCollege,
    ensureRoleByNameInternal,
    grantStudentPermissionsToRole,
    syncTeacherClassTeacherAssignment
};