import prisma from "../../utils/prisma.js";
import { createNotification, createNotifications } from "../notification/notification.service.js";
import { MAX_CHAT_ID_LENGTH, attachmentSchema, createMessageSchema, updateMessageSchema } from "./schemas.js";

const DEFAULT_CHAT_ROOM = "default";

const pronounBySex = {
    male: "he/him",
    female: "she/her",
    other: "they/them"
};

const normalizeChatId = (value, req = null) => {
    const defaultRoom = req?.user?.collegeId ? `global_${req.user.collegeId}` : DEFAULT_CHAT_ROOM;
    let explicitId = String(value || "").trim();
    if (!explicitId || explicitId === "default") {
        explicitId = defaultRoom;
    }
    return explicitId && explicitId !== "default" ? explicitId.slice(0, MAX_CHAT_ID_LENGTH) : defaultRoom;
};

const normalizeMentions = (mentions = []) => {
    if (!Array.isArray(mentions)) return [];

    return Array.from(new Set(
        mentions
            .map((entry) => String(entry ?? "").trim().replace(/^@/, "").toLowerCase())
            .filter(Boolean)
    ));
};

const normalizeMentionedUserIds = (mentionedUserIds = []) => {
    if (!Array.isArray(mentionedUserIds)) return [];

    return Array.from(new Set(
        mentionedUserIds
            .map((entry) => String(entry ?? "").trim())
            .filter(Boolean)
    ));
};

const normalizeProfile = (user) => {
    const detail = user.userDetails || {};
    const firstName = detail.firstName || "";
    const lastName = detail.lastName || "";
    const displayName = detail.displayName || `${firstName} ${lastName}`.trim() || user.username;
    const grade = user.enrollments?.find((item) => item.grade)?.grade || "N/A";
    const customRoles = (user.roles || []).map((item) => item.role?.name).filter(Boolean);
    const roles = customRoles.length ? customRoles : [user.type];

    return {
        id: user.id,
        username: user.username,
        displayName,
        avatar: detail.avatar || "",
        pronouns: pronounBySex[detail.sex] || "they/them",
        grade,
        roles,
        type: user.type
    };
};

const normalizeMessageRecord = (msg) => {
    const user = msg.user;
    const details = user?.userDetails || {};
    const firstName = details.firstName || "";
    const lastName = details.lastName || "";
    const liveDisplayName = details.displayName || `${firstName} ${lastName}`.trim() || user?.username;

    return {
        id: msg.id,
        userId: msg.userId,
        username: user?.username || msg.username,
        displayName: liveDisplayName || msg.displayName,
        avatar: details.avatar || msg.avatar,
        role: user?.type || msg.role,
        content: msg.content,
        mentions: Array.isArray(msg.mentions) ? msg.mentions : msg.mentions || [],
        mentionedUserIds: Array.isArray(msg.mentionedUserIds) ? msg.mentionedUserIds : msg.mentionedUserIds || [],
        replyTo: msg.replyTo,
        attachments: Array.isArray(msg.attachments) ? msg.attachments : msg.attachments || [],
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
    };
};

async function resolveMentionTargets({ chatId, collegeId, mentions = [], mentionedUserIds = [], actorUserId }) {
    const normalizedNames = normalizeMentions(mentions);
    const normalizedIds = normalizeMentionedUserIds(mentionedUserIds);
    if (normalizedNames.length === 0 && normalizedIds.length === 0) {
        return [];
    }

    const recentChatMembers = await prisma.chatMessage.findMany({
        where: { chatId },
        select: { userId: true },
        distinct: ["userId"],
    });

    const allowedUserIds = new Set(recentChatMembers.map((entry) => entry.userId));
    if (allowedUserIds.size === 0 && collegeId) {
        const collegeUsers = await prisma.user.findMany({
            where: { collegeId },
            select: { id: true },
        });
        collegeUsers.forEach((entry) => allowedUserIds.add(entry.id));
    }

    const users = await prisma.user.findMany({
        where: {
            ...(collegeId ? { collegeId } : {}),
            OR: [
                ...(normalizedIds.length > 0 ? [{ id: { in: normalizedIds } }] : []),
                ...(normalizedNames.length > 0 ? [{ username: { in: normalizedNames } }] : []),
            ],
        },
        select: {
            id: true,
            username: true,
        },
    });

    return users
        .filter((user) => allowedUserIds.size === 0 || allowedUserIds.has(user.id))
        .map((user) => ({
            id: user.id,
            username: user.username,
        }));
}

export async function dispatchMentionNotifications({
    actor,
    chatId,
    message,
    mentionTargets,
    replyTargetUserId,
}) {
    const baseUrl = `/chat#msg-${message.id}`;
    const previewText = String(message.content || "").slice(0, 100);

    if (mentionTargets.length > 0) {
        const payloads = mentionTargets.map((target) => ({
            userId: target.id,
            actorId: actor.id,
            title: `@${actor.username} mentioned you`,
            message: previewText,
            type: "mention",
            relatedId: message.id,
            messageId: message.id,
            channelId: chatId,
            entityUrl: baseUrl,
        }));

        await createNotifications(payloads);
    }

    if (replyTargetUserId && replyTargetUserId !== actor.id && !mentionTargets.some((target) => target.id === replyTargetUserId)) {
        await createNotification({
            userId: replyTargetUserId,
            actorId: actor.id,
            title: `${actor.displayName} replied to you`,
            message: previewText,
            type: "reply",
            relatedId: message.id,
            messageId: message.id,
            channelId: chatId,
            entityUrl: baseUrl,
        });
    }
}

export {
    normalizeChatId,
    normalizeMentions,
    normalizeMentionedUserIds,
    normalizeProfile,
    normalizeMessageRecord,
    resolveMentionTargets,
    pronounBySex,
    DEFAULT_CHAT_ROOM
};