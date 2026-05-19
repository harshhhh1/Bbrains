import { prisma } from '../../utils/prisma.js';
import { clearFeaturesCache } from '../../utils/featureFlags.js';

export const getAllColleges = async () => {
    return await prisma.college.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

export const getCollegeFeatures = async (collegeId) => {
    const college = await prisma.college.findUnique({
        where: { id: parseInt(collegeId) },
        select: { features: true }
    });
    return college ? (college.features || {}) : null;
};

export const updateCollegeFeatures = async (collegeId, features) => {
    return await prisma.college.update({
        where: { id: parseInt(collegeId) },
        data: { features }
    });
};

export const getGlobalFeatures = async () => {
    const config = await prisma.systemConfig.findUnique({
        where: { key: 'global_features' }
    });
    return config ? JSON.parse(config.value) : {};
};

export const updateGlobalFeatures = async (features) => {
    const config = await prisma.systemConfig.upsert({
        where: { key: "global_features" },
        update: { value: JSON.stringify(features) },
        create: {
            key: "global_features",
            value: JSON.stringify(features),
            type: "json",
            description: "Global feature flags"
        }
    });
    clearFeaturesCache();
    return config;
};

export const getDashboardStats = async () => {
    const [collegeCount, userCount, courseCount, recentColleges] = await Promise.all([
        prisma.college.count(),
        prisma.user.count(),
        prisma.course.count(),
        prisma.college.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, createdAt: true }
        })
    ]);

    return {
        totalColleges: collegeCount,
        totalUsers: userCount,
        totalCourses: courseCount,
        recentColleges
    };
};

export const getTopColleges = async (limit = 5) => {
    const colleges = await prisma.college.findMany({
        take: limit,
        select: {
            id: true,
            name: true,
            email: true,
            _count: {
                select: { users: true }
            }
        },
        orderBy: {
            users: { _count: 'desc' }
        }
    });

    return colleges.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        userCount: c._count.users
    }));
};

export const getRecentAuditLogs = async (limit = 10) => {
    return await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: { firstName: true, lastName: true }
                    }
                }
            }
        }
    });
};

export const getPendingActions = async () => {
    const [pendingProducts, pendingSuggestions] = await Promise.all([
        prisma.product.count({ where: { approval: 'pending' } }),
        prisma.suggestion.count({ where: { status: 'pending' } })
    ]);

    return {
        pendingProducts,
        pendingSuggestions,
        totalPending: pendingProducts + pendingSuggestions
    };
};
