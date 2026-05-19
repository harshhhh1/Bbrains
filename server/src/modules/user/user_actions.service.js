import prisma from "../../utils/prisma.js";
import { awardXpToUser } from "../xp/xp.service.js";
import bcrypt from "bcrypt";

const DAILY_REWARD_XP = [50, 50, 75, 75, 100, 100, 200];
const DAILY_REWARD_COINS = [10, 10, 15, 15, 20, 20, 50];
const STREAK_RESET_HOURS = 48;
const CLAIM_COOLDOWN_HOURS = 24;

const updateUser = async (id, data) => {
    const { 
        username, email, password, type, status, 
        firstName, lastName, middlename, avatar, displayName, sex, dob, phone, bio, teacherSubjects,
        roleIds 
    } = data;

    const userUpdateData = {};
    if (username) userUpdateData.username = username;
    if (email) userUpdateData.email = email;
    if (type) userUpdateData.type = type;
    if (password && password.trim() !== "") {
        userUpdateData.password = await bcrypt.hash(password, 10);
    }

    const detailsUpdateData = {};
    if (firstName !== undefined) detailsUpdateData.firstName = firstName;
    if (lastName !== undefined) detailsUpdateData.lastName = lastName;
    if (middlename !== undefined) detailsUpdateData.middlename = middlename;
    if (avatar !== undefined) detailsUpdateData.avatar = avatar;
    if (displayName !== undefined) detailsUpdateData.displayName = displayName;
    if (sex !== undefined) detailsUpdateData.sex = sex;
    if (dob !== undefined && dob !== null) detailsUpdateData.dob = new Date(dob);
    if (phone !== undefined) detailsUpdateData.phone = phone;
    if (bio !== undefined) detailsUpdateData.bio = bio;
    if (teacherSubjects !== undefined) detailsUpdateData.teacherSubjects = teacherSubjects;

    return await prisma.$transaction(async (tx) => {
        // 1. Update Core User
        const user = await tx.user.update({
            where: { id },
            data: userUpdateData
        });

        // 2. Update User Details (Upsert since it might not exist)
        if (Object.keys(detailsUpdateData).length > 0) {
            await tx.userDetails.upsert({
                where: { userId: id },
                update: detailsUpdateData,
                create: {
                    userId: id,
                    firstName: detailsUpdateData.firstName || "",
                    lastName: detailsUpdateData.lastName || "",
                    dob: detailsUpdateData.dob || new Date(),
                    sex: detailsUpdateData.sex || "other",
                    ...detailsUpdateData
                }
            });
        }

        // 3. Update Roles if roleIds provided
        if (roleIds && Array.isArray(roleIds)) {
            // Remove existing roles
            await tx.userRoles.deleteMany({
                where: { userId: id }
            });

            // Add new roles
            if (roleIds.length > 0) {
                await tx.userRoles.createMany({
                    data: roleIds.map(roleId => ({
                        userId: id,
                        roleId: Number(roleId)
                    }))
                });
            }
        }

        return await tx.user.findUnique({
            where: { id },
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
    });
};

const deleteUser = async (id) => {
    return await prisma.user.delete({
        where: { id: id }
    });
};

const claimDailyRewards = async (userId) => {
    const existingStreak = await prisma.streak.findUnique({
        where: { userId }
    });

    const now = new Date();
    let currentStreak = existingStreak?.currentStreak || 0;

    if (existingStreak?.lastClaimedAt) {
        const lastClaim = new Date(existingStreak.lastClaimedAt);
        const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastClaim < CLAIM_COOLDOWN_HOURS) {
            throw new Error("Already claimed today. Please wait before claiming again.");
        }

        if (hoursSinceLastClaim > STREAK_RESET_HOURS) {
            currentStreak = 0;
        }
    }

    const rewardXP = DAILY_REWARD_XP[currentStreak % DAILY_REWARD_XP.length] ?? DAILY_REWARD_XP[0];
    const rewardCoins = DAILY_REWARD_COINS[currentStreak % DAILY_REWARD_COINS.length] ?? DAILY_REWARD_COINS[0];

    // Use a transaction to ensure all updates succeed or fail together
    const txResult = await prisma.$transaction(async (tx) => {
        // 1. Update/Create Wallet (Coins)
        await tx.wallet.upsert({
            where: { userId: userId },
            update: {
                balance: { increment: rewardCoins }
            },
            create: {
                id: crypto.randomUUID(),
                userId: userId,
                balance: rewardCoins,
                pin: "000000"
            }
        });

        // 3. Log the action
        await tx.auditLog.create({
            data: {
                user: { connect: { id: userId } },
                category: "SYSTEM",
                action: "DAILY_CLAIM",
                entity: "User",
                entityId: userId,
                change: {
                    xp: rewardXP,
                    coins: rewardCoins,
                    day: (currentStreak % DAILY_REWARD_XP.length) + 1
                }
            }
        });

        const updatedStreak = await tx.streak.upsert({
            where: { userId },
            update: {
                currentStreak: currentStreak + 1,
                lastClaimedAt: now
            },
            create: {
                userId,
                currentStreak: 1,
                lastClaimedAt: now
            }
        });

        return updatedStreak;
    });

    // 2. Update XP using canonical service to trigger level ups and achievements
    await awardXpToUser(userId, rewardXP).catch(err => console.error("Failed to award XP after daily claim:", err));

    return {
        xp: rewardXP,
        coins: rewardCoins,
        streak: {
            id: txResult.id,
            userId: txResult.userId,
            currentStreak: Number(txResult.currentStreak || 0),
            lastClaimedAt: txResult.lastClaimedAt,
            canClaim: false,
            hoursUntilNextClaim: CLAIM_COOLDOWN_HOURS
        }
    };
};

export { updateUser, deleteUser, claimDailyRewards };
