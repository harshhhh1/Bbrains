import {
    getUserNotifications,
    markNotificationAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnreadChatCounts,
    markChannelNotificationsRead,
} from "./notification.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import prisma from "../../utils/prisma.js";

const getStatusCode = (error, fallbackStatus = 500) => {
    if (typeof error?.statusCode === "number") {
        return error.statusCode;
    }

    return fallbackStatus;
};

function parseSubscription(payload = {}) {
    const endpoint = String(payload?.endpoint || "").trim();
    const p256dh = String(payload?.keys?.p256dh || "").trim();
    const auth = String(payload?.keys?.auth || "").trim();

    if (!endpoint || !p256dh || !auth) {
        return null;
    }

    return { endpoint, p256dh, auth };
}

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset, unreadOnly } = req.query;

        const notifications = await getUserNotifications(
            userId,
            limit ? parseInt(limit, 10) : 20,
            offset ? parseInt(offset, 10) : 0,
            unreadOnly === "true"
        );

        const unreadCount = await getUnreadCount(userId);
        return sendSuccess(res, { notifications, unreadCount });
    } catch (error) {
        console.error("Get notifications error:", error);
        return sendError(res, error?.message || "Failed to fetch notifications", getStatusCode(error));
    }
};

export const subscribeToPushNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return sendError(res, "Unauthorized", 401);
        }

        const subscription = parseSubscription(req.body);
        if (!subscription) {
            return sendError(res, "Invalid push subscription payload", 400);
        }

        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId,
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
        });

        return sendSuccess(res, { endpoint: subscription.endpoint }, "Push subscription saved", 201);
    } catch (error) {
        console.error("Subscribe push error:", error);
        return sendError(res, error?.message || "Failed to save push subscription", getStatusCode(error));
    }
};

export const unsubscribeFromPushNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return sendError(res, "Unauthorized", 401);
        }

        const endpoint = String(req.body?.endpoint || "").trim();
        if (!endpoint) {
            return sendError(res, "Subscription endpoint is required", 400);
        }

        await prisma.pushSubscription.deleteMany({
            where: {
                endpoint,
                userId,
            },
        });

        return sendSuccess(res, null, "Push subscription removed");
    } catch (error) {
        console.error("Unsubscribe push error:", error);
        return sendError(res, error?.message || "Failed to remove push subscription", getStatusCode(error));
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        if (!id) return sendError(res, "Notification ID is required", 400);

        const result = await markNotificationAsRead(userId, id);
        if (!result?.count) {
            return sendError(res, "Notification not found", 404);
        }

        return sendSuccess(res, null, "Notification marked as read");
    } catch (error) {
        console.error("Mark notification read error:", error);
        return sendError(res, error?.message || "Failed to mark notification as read", getStatusCode(error));
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await markAllAsRead(userId);
        return sendSuccess(res, null, "All notifications marked as read");
    } catch (error) {
        console.error("Mark all read error:", error);
        return sendError(res, error?.message || "Failed to mark all notifications as read", getStatusCode(error));
    }
};

export const markChannelRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const channelId = String(req.body?.channelId || "").trim();

        if (!channelId) {
            return sendError(res, "Channel ID is required", 400);
        }

        await markChannelNotificationsRead(userId, channelId);
        return sendSuccess(res, null, "Channel notifications marked as read");
    } catch (error) {
        console.error("Mark channel read error:", error);
        return sendError(res, error?.message || "Failed to mark channel notifications as read", getStatusCode(error));
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const [count, unreadChatCounts] = await Promise.all([
            getUnreadCount(userId),
            getUnreadChatCounts(userId),
        ]);

        return sendSuccess(res, {
            count,
            total: unreadChatCounts.total,
            byChannel: unreadChatCounts.byChannel,
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        return sendError(res, error?.message || "Failed to get unread count", getStatusCode(error));
    }
};
