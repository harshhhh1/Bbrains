import prisma from '../../utils/prisma.js';

export const getLeaderboard = async (category = 'allTime', sortBy = 'xp', limit = 20, offset = 0) => {
    const now = new Date();
    
    if (category === 'allTime') {
        const rankCol = sortBy === 'points' ? '"pointsRank"' : '"xpRank"';
        const valueCol = sortBy === 'points' ? '"totalPoints"' : '"totalXp"';

        const rows = await prisma.$queryRawUnsafe(
            `SELECT "userId", "username", "firstName", "lastName", "avatar",
                    COALESCE("totalXp", 0)::int AS "totalXp",
                    COALESCE("totalPoints", 0)::int AS "totalPoints",
                    COALESCE(${rankCol}, 0)::int AS rank,
                    COALESCE(${valueCol}, 0)::int AS value
             FROM "leaderboard_view"
             ORDER BY ${rankCol} ASC, "username" ASC
             LIMIT $1 OFFSET $2`,
            limit,
            offset
        );
        return rows;
    }

    let periodStart;
    if (category === 'weekly') {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - diff);
        periodStart.setHours(0, 0, 0, 0);
    } else if (category === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        periodStart = new Date(2020, 0, 1);
    }

    const leaderboardData = await prisma.leaderboard.findMany({
        where: {
            category: category,
            periodStart: {
                gte: periodStart
            }
        },
        include: {
            user: {
                select: {
                    userId: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { score: 'desc' },
            { user: { username: 'asc' } }
        ],
        skip: offset,
        take: limit
    });

    return leaderboardData.map((entry, index) => ({
        userId: entry.userId,
        username: entry.user?.username,
        firstName: entry.user?.userDetails?.firstName,
        lastName: entry.user?.userDetails?.lastName,
        avatar: entry.user?.userDetails?.avatar,
        totalXp: 0,
        totalPoints: 0,
        rank: offset + index + 1,
        value: Number(entry.score)
    }));
};

export const getMyPosition = async (userId, category = 'allTime', sortBy = 'xp') => {
    const now = new Date();
    
    if (category === 'allTime') {
        const rankCol = sortBy === 'points' ? '"pointsRank"' : '"xpRank"';
        const valueCol = sortBy === 'points' ? '"totalPoints"' : '"totalXp"';

        const rows = await prisma.$queryRawUnsafe(
            `SELECT "userId", "username", "firstName", "lastName", "avatar",
                    COALESCE("totalXp", 0)::int AS "totalXp",
                    COALESCE("totalPoints", 0)::int AS "totalPoints",
                    COALESCE(${rankCol}, 0)::int AS rank,
                    COALESCE(${valueCol}, 0)::int AS value
             FROM "leaderboard_view"
             WHERE "userId" = $1`,
            userId
        );

        return rows[0] || null;
    }

    let periodStart;
    if (category === 'weekly') {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - diff);
        periodStart.setHours(0, 0, 0, 0);
    } else if (category === 'monthly') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        periodStart = new Date(2020, 0, 1);
    }

    const entry = await prisma.leaderboard.findFirst({
        where: {
            userId: userId,
            category: category,
            periodStart: {
                gte: periodStart
            }
        },
        include: {
            user: {
                select: {
                    userId: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            }
        },
        orderBy: { score: 'desc' }
    });

    if (!entry) {
        return null;
    }

    const rank = await prisma.leaderboard.count({
        where: {
            category: category,
            periodStart: { gte: periodStart },
            score: { gt: entry.score }
        }
    });

    return {
        userId: entry.userId,
        username: entry.user?.username,
        firstName: entry.user?.userDetails?.firstName,
        lastName: entry.user?.userDetails?.lastName,
        avatar: entry.user?.userDetails?.avatar,
        totalXp: 0,
        totalPoints: 0,
        rank: rank + 1,
        value: Number(entry.score)
    };
};
