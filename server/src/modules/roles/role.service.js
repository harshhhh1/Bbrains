import prisma from '../../utils/prisma.js';

export const createRoleRecord = async (data) => {
    return await prisma.role.create({ data });
};

export const getAllRoles = async (collegeId) => {
    return await prisma.role.findMany({
        where: {
            OR: [
                { collegeId: collegeId ? Number(collegeId) : null },
                { collegeId: null }
            ]
        },
        include: { 
            _count: { select: { users: true } },
            permissions: {
                include: {
                    permission: true
                }
            }
        },
        orderBy: { position: 'asc' }
    });
};

export const getAllPermissions = async () => {
    return await prisma.permission.findMany({
        orderBy: { category: 'asc' }
    });
};

export const updateRoleRecord = async (id, data) => {
    const { permissions, ...roleData } = data;
    
    return await prisma.$transaction(async (tx) => {
        const role = await tx.role.update({ 
            where: { id: Number(id) }, 
            data: roleData 
        });

        if (permissions) {
            await tx.rolePermission.deleteMany({
                where: { roleId: Number(id) }
            });

            if (permissions.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissions.map(p => ({
                        roleId: Number(id),
                        permissionId: p.permissionId,
                        enabled: p.enabled
                    }))
                });
            }
        }
        return role;
    });
};

export const deleteRoleRecord = async (id) => {
    // Check if users are assigned
    const count = await prisma.userRoles.count({ where: { roleId: id } });
    if (count > 0) throw new Error('Cannot delete role with assigned users');
    return await prisma.role.delete({ where: { id } });
};

export const assignRoleToUser = async (userId, roleId) => {
    return await prisma.userRoles.create({
        data: { userId, roleId }
    });
};

export const removeRoleFromUser = async (userId, roleId) => {
    return await prisma.userRoles.delete({
        where: { userId_roleId: { userId, roleId } }
    });
};

export const getUserRoles = async (userId) => {
    return await prisma.userRoles.findMany({
        where: { userId },
        include: { role: true }
    });
};

export const getUsersWithRoles = async (collegeId) => {
    return await prisma.user.findMany({
        where: collegeId ? { collegeId } : {},
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            username: true,
            email: true,
            type: true,
            userDetails: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    sex: true,
                    dob: true,
                    phone: true,
                    bio: true,
                    teacherSubjects: true,
                }
            },
            roles: {
                select: {
                    role: true
                }
            },
            enrollments: {
                select: {
                    courseId: true,
                    course: {
                        select: {
                            id: true,
                            name: true,
                            standard: true
                        }
                    }
                }
            },
            classTeacherCourse: {
                select: {
                    id: true,
                    name: true,
                    standard: true
                }
            }
        }
    });
};
