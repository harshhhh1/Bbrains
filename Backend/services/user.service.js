import prisma from "../utils/prisma.js";
import jwt from 'jsonwebtoken'

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

const createUser = async (username, email, collegeId, password, avatar) => {
    return await prisma.user.create({
        data: {
            username,
            email,
            collegeId,
            password,
            // Use a nested create to automatically link the UserDetails
            userDetails: {
                create: {
                    avatar: avatar,
                    firstName: "",
                    lastName: "",
                    sex: "other",
                    dob: new Date("2005-07-08"), // Prisma requires a Date object
                    phone: "7634928634"          // Use a string for phone numbers
                }
            }
        },
    });
};

const getUserDetailsByID = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            type: true,
            college: {
                select: {
                    name: true,
                    regNo: true,
                },
            },
            userDetails: {
                select: {
                    avatar: true,
                    firstName: true,
                    lastName: true,
                    sex: true,
                    dob: true,
                    phone: true,
                    grade: true,
                    status: true,
                    streak: true,
                    address: {
                        select: {
                            addressLine1: true,
                            addressLine2: true,
                            city: true,
                            state: true,
                            postalCode: true,
                            country: true,
                        },
                    },
                },
            },
            roles: {
                select: {
                    role: {
                        select: {
                            name: true,
                            description: true,
                        },
                    },
                },
            },
            wallet: {
                select: {
                    id: true,
                    balance: true,
                },
            },
            xp: {
                select: {
                    xp: true,
                    level: true,
                },
            },
            leaderboards: {
                where: { category: 'allTime' }, // Assuming request meant all time or specific period. Taking allTime for profile.
                select: {
                    rank: true,
                    score: true
                },
                take: 1
            },
            userAchievements: {
                select: {
                    achievement: {
                        select: {
                            name: true,
                            icon: true,
                            description: true
                        }
                    }
                }
            }
        },
    });

    if (!user) return null;

    // Fetch next level info for maxXP calculation
    const currentLevel = user.xp?.level || 1;
    const nextLevelData = await prisma.level.findUnique({
        where: { levelNumber: currentLevel + 1 }
    });

    // If already max level (no next level), we can treat current XP as max or handle gracefully
    // Assuming standard behavior: maxXP is the requirement for the NEXT level.
    // Ideally we also need previous level XP to calculate "currentXP" as strictly progress within the level,
    // but often "currentXP" just means "total XP user has". 
    // The prompt asks for: "currentXP" and "maxXP(xp required to obtain next level)".
    // Usually Profile Card progress bar = (TotalXP - PrevLevelXP) / (NextLevelXP - PrevLevelXP).
    // OR it explicitly means: currentXP = user.xp, maxXP = nextLevel.requiredXP.
    // Let's provide raw values and let frontend compute percentage, or compute "progress".
    // "maxXP (xp required to obtain next level)" -> This sounds like the Total XP threshold for the next level.

    // Let's refine based on "currentXP" vs "totalXP". 
    // If totalXP is the running total, currentXP might mean XP gained *towards* the next level? 
    // I will return `currentLevelXP` (XP accumulated in this level) and `nextLevelReqXP` (XP needed for next level).

    // But checking the prompt: "totalXP", "level", "currentXP", "maxXP".
    // I'll assume:
    // totalXP: user.xp
    // currentXP: user.xp (or maybe relative? I'll stick to total for now unless "progress" is implied)
    // maxXP: nextLevelData.requiredXp

    // Wait, if it's for a progress bar:
    // It's usually: Value = CurrentXP, Max = TargetXP.

    const maxXP = nextLevelData?.requiredXp || 0; // 0 or null if max level reached

    // Formatting the response structure
    return {
        ...user,
        name: `${user.userDetails?.firstName || ''} ${user.userDetails?.lastName || ''}`.trim(),
        className: user.userDetails?.grade,
        avatarUrl: user.userDetails?.avatar,
        isOnline: user.userDetails?.status, // Enum value: online, idle, dnd, offline
        leaderboardRank: user.leaderboards?.[0]?.rank || null,
        totalXP: user.xp?.xp || 0,
        level: user.xp?.level || 1,
        currentXP: user.xp?.xp || 0, // Sending total XP as current. can adjust if "relative to level" is needed.
        maxXP: maxXP,
        streak: user.userDetails?.streak || 0,
        badges: user.userAchievements?.map(ua => ua.achievement) || []
    };
};

const getUserDataHandler = async (req, res) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await getUserDetailsByID(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            status: "success",
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: "Invalid or expired token",
            error: error.message || error
        });
    }
};

const getUsersByRole = async (roleName) => {
    return await prisma.user.findMany({
        where: {
            type: roleName // 'student' or 'teacher' from enum
        },
        select: {
            id: true,
            username: true,
            email: true,
            type: true,
            userDetails: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            }
        }
    });
};

const getUserByName = async (name) => {
    return await prisma.user.findFirst({
        where: {
            username: {
                contains: name,
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            username: true,
            email: true,
            type: true,
            userDetails: true
        }
    });
};

// Assuming 'createTeacher' creates a user with type 'teacher'
// We can reuse 'createUser' but might need to enforce the role.
// For now, let's just use the existing createUser but exposed specifically or allow type override
const createTeacher = async (data) => {
    return await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: data.password, // Remember to hash in controller
            collegeId: data.collegeId,
            type: 'teacher',
            userDetails: {
                create: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    sex: data.sex,
                    dob: new Date(data.dob),
                    phone: data.phone
                }
            }
        }
    });
};

export { findUserByEmail, createUser, getUserDetailsByID, getUserDataHandler, getUsersByRole, getUserByName, createTeacher };
