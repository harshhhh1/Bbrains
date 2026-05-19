import prisma from '../../utils/prisma.js';
import crypto from 'crypto';

export const getStreak = async (userId) => {
    let streak = await prisma.streak.findUnique({
        where: { userId }
    });

    if (!streak) {
        streak = await prisma.streak.create({
            data: {
                userId,
                currentStreak: 0
            }
        });
    }

    return streak;
};

export const claimDailyPoints = async (userId) => {
    const streak = await getStreak(userId);
    const now = new Date();

    if (streak.lastClaimedAt) {
        const lastClaim = new Date(streak.lastClaimedAt);
        const timeDiff = now.getTime() - lastClaim.getTime();
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed < 24) {
            throw new Error('Already claimed today. Please wait 24 hours.');
        }

        // Reset streak if more than 48 hours have passed
        if (hoursPassed > 48) {
            streak.currentStreak = 0;
        }
    }

    const XP_REWARDS = [50, 50, 75, 75, 100, 100, 200];
    const COIN_REWARDS = [10, 10, 15, 15, 20, 20, 50];
    const dayIndex = (streak.currentStreak || 0) % 7;
    const rewardXP = XP_REWARDS[dayIndex];
    const rewardCoins = COIN_REWARDS[dayIndex];

    return await prisma.$transaction(async (tx) => {
        // 1. Award XP
        await tx.xp.upsert({
            where: { userId },
            update: { xp: { increment: rewardXP } },
            create: { userId, xp: rewardXP, level: 1 }
        });

        // 2. Award Coins
        await tx.wallet.upsert({
            where: { userId },
            update: { balance: { increment: rewardCoins } },
            create: {
                id: crypto.randomUUID(),
                userId,
                balance: rewardCoins,
                pin: '000000'
            }
        });

        // 3. Log Action
        await tx.auditLog.create({
            data: {
                user: { connect: { id: userId } },
                category: 'SYSTEM',
                action: 'DAILY_CLAIM',
                entity: 'User',
                entityId: userId,
                change: { xp: rewardXP, coins: rewardCoins, day: dayIndex + 1 }
            }
        });

        // 4. Update Streak
        return await tx.streak.update({
            where: { userId },
            data: {
                currentStreak: (streak.currentStreak || 0) + 1,
                lastClaimedAt: now
            }
        });
    });
};
