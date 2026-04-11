import prisma from "../../utils/prisma.js";

const CHAT_NOTIFICATION_TYPES = ["mention", "reply"];

const ensureNotificationModelAvailable = (client = prisma) => {
    if (!client?.notification) {
        throw new Error("Prisma client for Notification model is not available. Ensure 'npx prisma generate' has run and migrations are up to date.");
    }
};

function normalizeReadData(read) {
    return read
        ? { read: true, readAt: new Date() }
        : { read: false, readAt: null };
}

function normalizeLegacyArgs(userId, title, message, type, relatedId = null) {
    return {
        userId,
        title,
        message,
        type,
        relatedId,
    };
}

export const createNotification = async (...args) => {
    ensureNotificationModelAvailable();

    const payload =
        typeof args[0] === "object" && args[0] !== null
            ? args[0]
            : normalizeLegacyArgs(...args);

    return await prisma.notification.create({
        data: {
            userId: payload.userId,
            actorId: payload.actorId ?? null,
            title: payload.title,
            message: payload.message ?? null,
            type: payload.type,
            relatedId: payload.relatedId ?? null,
            messageId: payload.messageId ?? null,
            channelId: payload.channelId ?? null,
            entityUrl: payload.entityUrl ?? null,
            ...normalizeReadData(Boolean(payload.read)),
        }
    });
};

export const createNotifications = async (notifications = []) => {
    ensureNotificationModelAvailable();

    if (!Array.isArray(notifications) || notifications.length === 0) {
        return { count: 0 };
    }

    const result = await prisma.notification.createMany({
        data: notifications.map((notification) => ({
            userId: notification.userId,
            actorId: notification.actorId ?? null,
            title: notification.title,
            message: notification.message ?? null,
            type: notification.type,
            relatedId: notification.relatedId ?? null,
            messageId: notification.messageId ?? null,
            channelId: notification.channelId ?? null,
            entityUrl: notification.entityUrl ?? null,
            ...normalizeReadData(Boolean(notification.read)),
        }))
    });

    return result;
};

export const getUserNotifications = async (userId, limit = 20, offset = 0, unreadOnly = false) => {
    ensureNotificationModelAvailable();

    const where = { userId };
    if (unreadOnly) {
        where.readAt = null;
    }

    return await prisma.notification.findMany({
        where,
        include: {
            actor: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: Math.min(Math.max(Number(limit) || 20, 1), 100),
        skip: Math.max(Number(offset) || 0, 0),
    });
};

export const markNotificationAsRead = async (userId, notificationId) => {
    ensureNotificationModelAvailable();
    return await prisma.notification.updateMany({
        where: {
            id: parseInt(notificationId, 10),
            userId,
        },
        data: normalizeReadData(true),
    });
};

export const markAllAsRead = async (userId) => {
    ensureNotificationModelAvailable();
    return await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: normalizeReadData(true),
    });
};

export const markChannelNotificationsRead = async (userId, channelId) => {
    ensureNotificationModelAvailable();
    return await prisma.notification.updateMany({
        where: {
            userId,
            channelId,
            type: { in: CHAT_NOTIFICATION_TYPES },
            readAt: null,
        },
        data: normalizeReadData(true),
    });
};

export const getUnreadCount = async (userId) => {
    ensureNotificationModelAvailable();
    return await prisma.notification.count({
        where: { userId, readAt: null },
    });
};

export const getUnreadChatCounts = async (userId) => {
    ensureNotificationModelAvailable();

    const unread = await prisma.notification.findMany({
        where: {
            userId,
            type: { in: CHAT_NOTIFICATION_TYPES },
            readAt: null,
        },
        select: {
            channelId: true,
        },
    });

    const byChannel = unread.reduce((acc, item) => {
        const key = item.channelId || "default";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    return {
        total: unread.length,
        byChannel,
    };
};
