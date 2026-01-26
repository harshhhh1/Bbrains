import prisma from "../utils/prisma.js";

const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id: id },
        data: data
    });
};

const deleteUser = async (id) => {
    return await prisma.user.delete({
        where: { id: id }
    });
};

const claimDailyRewards = async (userId) => {
    // Check if user has claimed in the last 24 hours
    const lastClaim = await prisma.userLogs.findFirst({
        where: {
            userId: userId,
            action: "daily_claim",
            timestamp: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        },
        orderBy: {
            timestamp: 'desc'
        }
    });

    if (lastClaim) {
        throw new Error("Daily reward already claimed in the last 24 hours");
    }

    // Define rewards
    const rewardXP = 50;
    const rewardCoins = 100;

    // Use a transaction to ensure all updates succeed or fail together
    return await prisma.$transaction(async (tx) => {
        // 1. Update/Create XP
        await tx.xp.upsert({
            where: { userId: userId },
            update: {
                xp: { increment: rewardXP }
            },
            create: {
                userId: userId,
                xp: rewardXP,
                level: 1
            }
        });

        // 2. Update/Create Wallet (Coins)
        await tx.wallet.upsert({
            where: { userId: userId },
            update: {
                balance: { increment: rewardCoins }
            },
            create: {
                userId: userId,
                balance: rewardCoins,
                pin: "0000" // Default pin from schema
            }
        });

        // 3. Log the action
        await tx.userLogs.create({
            data: {
                userId: userId,
                action: "daily_claim"
            }
        });

        return { xp: rewardXP, coins: rewardCoins };
    });
};

export { updateUser, deleteUser, claimDailyRewards };
