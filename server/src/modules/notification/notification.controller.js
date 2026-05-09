import {
    getUserNotifications,
    markNotificationAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnreadChatCounts,
    markChannelNotificationsRead,
} from "./notification.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

const getStatusCode = (error, fallbackStatus = 500) => {
    if (typeof error?.statusCode === "number") {
        return error.statusCode;
    }

    return fallbackStatus;
};

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
        const channelId = String(req.params.channelId || req.body?.channelId || "").trim();

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
