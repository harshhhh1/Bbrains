import prisma from '../../../utils/prisma.js';
import { sendSuccess } from '../../../utils/response.js';
import {
    feeNoteKeywords,
    buildTransactionSignalFilters,
    firstDefinedConfig,
    toPlainNumber,
    calculateStreak,
} from '../helpers.js';

export const studentDashboard = async (currentUser, res) => {
    try {
        const userId = String(currentUser.id);
        const collegeId = currentUser.collegeId ? Number(currentUser.collegeId) : null;

        const [
            user,
            enrollments,
            xp,
            achievements,
            wallet,
            recentGrades,
            leaderboardPos,
            leaderboardEntries,
            xpLeaderboard,
            announcements,
            recentClaims,
            configs,
            feeDebits,
            feeCredits,
            ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, username: true, email: true, type: true,
                    userDetails: { select: { avatar: true, firstName: true, lastName: true, displayName: true } },
                    college: { select: { name: true } }
                }
            }),
            prisma.enrollment.findMany({
                where: { userId },
                include: { course: { select: { name: true, id: true, feePerStudent: true } } }
            }),
            prisma.xp.findUnique({ where: { userId } }),
            prisma.userAchievements.findMany({
                where: { userId },
                include: { achievement: true },
                take: 5,
                orderBy: { unlockedAt: 'desc' }
            }),
            prisma.wallet.findUnique({
                where: { userId },
                select: { balance: true }
            }),
            prisma.grade.findMany({
                where: { userId },
                include: { assignment: { select: { title: true } } },
                take: 5,
                orderBy: { gradedAt: 'desc' }
            }),
            prisma.$queryRaw`SELECT "xpRank" as rank, "totalXp" as score FROM "leaderboard_view" WHERE "userId" = ${userId} AND "collegeId" = ${collegeId} LIMIT 1`,
            prisma.$queryRaw`SELECT "userId", "username", "firstName", "lastName", "avatar", "totalXp", "totalPoints", "xpRank" as rank FROM "leaderboard_view" WHERE "collegeId" = ${collegeId} ORDER BY "xpRank" ASC LIMIT 5`,
            prisma.xp.findMany({
                where: { user: { collegeId } },
                orderBy: { xp: 'desc' },
                take: 5,
                include: {
                    user: {
                        select: {
                            username: true,
                            userDetails: { select: { avatar: true, firstName: true, lastName: true, displayName: true } }
                        }
                    }
                }
            }),
            prisma.announcement.findMany({
                where: {
                    OR: [
                        { collegeId: collegeId },
                        { isGlobal: true }
                    ]
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            type: true,
                            userDetails: {
                                select: {
                                    avatar: true,
                                    firstName: true,
                                    lastName: true,
                                    displayName: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.auditLog.findMany({
                where: {
                    userId: userId,
                    action: "DAILY_CLAIM"
                },
                orderBy: { createdAt: 'desc' },
                take: 30
            }),
            prisma.systemConfig.findMany(),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    userId,
                    type: 'debit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
                },
            }),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    userId,
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
                },
            }),
        ]);

        const userLeaderboardPos = leaderboardPos && leaderboardPos[0] ? leaderboardPos[0] : null;
        const normalizedLeaderboardPos = userLeaderboardPos
            ? {
                rank: toPlainNumber(userLeaderboardPos.rank, null),
                score: toPlainNumber(userLeaderboardPos.score, 0),
            }
            : null;

        const userProfile = {
            ...user,
            avatar: user?.userDetails?.avatar,
            firstName: user?.userDetails?.firstName,
            lastName: user?.userDetails?.lastName,
            collegeName: user?.college?.name
        };

        const streak = calculateStreak(recentClaims);
        const configMap = new Map(configs.map((config) => [config.key, config]));
        const currencyKeys = ['currency', 'Currency', 'CURRENCY'];
        const currency = String(firstDefinedConfig(configMap, currencyKeys, 'INR') || 'INR');

        const totalFee = (enrollments || []).reduce(
            (sum, enrollment) => sum + Number(enrollment.course?.feePerStudent || 0),
            0
        );

        const debitFeePayments = Number(feeDebits._sum.amount || 0);
        const creditFeePayments = Number(feeCredits._sum.amount || 0);
        const paidAmount = debitFeePayments > 0 ? debitFeePayments : creditFeePayments;
        const hasConfiguredFee = totalFee > 0;
        const remainingAmount = hasConfiguredFee
            ? Math.max(totalFee - paidAmount, 0)
            : null;

        let currentLevel = null;
        let nextLevel = null;
        const userLevel = xp?.level || 1;

        if (xp) {
            currentLevel = await prisma.level.findFirst({
                where: { levelNumber: userLevel }
            });
            nextLevel = await prisma.level.findFirst({
                where: { levelNumber: userLevel + 1 }
            });
        }

        const currentLevelXp = currentLevel
            ? Number(currentLevel.requiredXp)
            : (userLevel - 1) * 1000;
        const nextLevelXp = nextLevel
            ? Number(nextLevel.requiredXp)
            : (nextLevel === null ? null : userLevel * 1000);

        const finalLeaderboard = leaderboardEntries && leaderboardEntries.length > 0
            ? leaderboardEntries.map((entry) => ({
                userId: entry.userId,
                totalXp: toPlainNumber(entry.totalXp, 0),
                totalPoints: toPlainNumber(entry.totalPoints, 0),
                rank: toPlainNumber(entry.rank, 0),
                username: entry.username,
                firstName: entry.firstName,
                lastName: entry.lastName,
                avatar: entry.avatar,
            }))
            : (xpLeaderboard || []).map((entry, index) => ({
                userId: entry.userId,
                totalXp: toPlainNumber(entry.xp, 0),
                rank: index + 1,
                username: entry.user?.username,
                firstName: entry.user?.userDetails?.firstName,
                lastName: entry.user?.userDetails?.lastName,
                avatar: entry.user?.userDetails?.avatar
            }));

        return sendSuccess(res, {
            user: userProfile,
            stats: {
                totalCourses: enrollments?.length || 0,
                xp: Number(xp?.xp) || 0,
                level: xp?.level || 1,
                currentLevelRequiredXp: currentLevelXp,
                nextLevelRequiredXp: nextLevelXp,
                walletBalance: Number(wallet?.balance) || 0,
                leaderboardRank: normalizedLeaderboardPos?.rank || null,
                totalAchievements: achievements?.length || 0,
                streak: streak
            },
            enrollments: enrollments || [],
            recentGrades: recentGrades || [],
            recentAchievements: achievements || [],
            leaderboard: finalLeaderboard,
            announcements: announcements || [],
            feeSummary: {
                currency,
                totalFee,
                paidAmount,
                remainingAmount,
                configured: hasConfiguredFee,
            }
        });
    } catch (error) {
        console.error('Student Dashboard error details:', error);
        throw error;
    }
};