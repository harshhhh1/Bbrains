import prisma from "../../utils/prisma.js";
import { sendError, sendSuccess } from "../../utils/response.js";
import { z } from "zod";
import { createNotification, createNotifications } from "../notification/notification.service.js";
import { createMessageSchema, updateMessageSchema } from "./schemas.js";
import {
    normalizeChatId,
    normalizeMentions,
    normalizeMentionedUserIds,
    normalizeProfile,
    normalizeMessageRecord,
    resolveMentionTargets,
    dispatchMentionNotifications
} from "./normalizers.js";

export const getChatMessages = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || "50"), 10), 1), 500);
        const chatId = normalizeChatId(req.query.chatId, req);
        const before = req.query.before;

        const whereClause = { chatId };

        if (before) {
            whereClause.createdAt = {
                lt: new Date(before)
            };
        }

        const messages = await prisma.chatMessage.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
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
            },
            orderBy: { createdAt: "desc" },
            take: limit
        });

        const parentIds = messages.map(m => m.replyTo).filter(Boolean);
        const parents = await prisma.chatMessage.findMany({
            where: { id: { in: parentIds } },
            select: { id: true, username: true, content: true }
        });
        const parentMap = Object.fromEntries(parents.map(p => [p.id, p]));

        messages.reverse();
        const results = messages.map(m => {
            const norm = normalizeMessageRecord(m);
            if (m.replyTo && parentMap[m.replyTo]) {
                norm.replyToDetails = parentMap[m.replyTo];
            }
            return norm;
        });

        return sendSuccess(res, results);
    } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        return sendError(res, "Failed to fetch chat messages", 500);
    }
};

export const searchChatMessages = async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || "50"), 10), 1), 100);
        const chatId = normalizeChatId(req.query.chatId, req);
        const query = String(req.query.q || "").trim();

        if (!query) {
            return sendSuccess(res, []);
        }

        const messages = await prisma.chatMessage.findMany({
            where: {
                chatId,
                OR: [
                    { content: { contains: query, mode: "insensitive" } },
                    { username: { contains: query, mode: "insensitive" } },
                    { displayName: { contains: query, mode: "insensitive" } },
                ],
            },
            include: {
                user: {
                    select: {
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
            },
            orderBy: { createdAt: "desc" },
            take: limit
        });

        const parentIds = messages.map(m => m.replyTo).filter(Boolean);
        const parents = await prisma.chatMessage.findMany({
            where: { id: { in: parentIds } },
            select: { id: true, username: true, content: true }
        });
        const parentMap = Object.fromEntries(parents.map(p => [p.id, p]));

        const results = messages.reverse().map(m => {
            const norm = normalizeMessageRecord(m);
            if (m.replyTo && parentMap[m.replyTo]) {
                norm.replyToDetails = parentMap[m.replyTo];
            }
            return norm;
        });

        return sendSuccess(res, results);
    } catch (error) {
        console.error("Failed to search chat messages:", error);
        return sendError(res, "Failed to search chat messages", 500);
    }
};

export const getChatMembers = async (req, res) => {
    try {
        const where = req.user?.collegeId
            ? { collegeId: req.user.collegeId }
            : undefined;

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                type: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        sex: true
                    }
                },
                enrollments: {
                    select: { grade: true },
                    take: 5
                },
                roles: {
                    select: {
                        role: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { username: "asc" }
        });

        return sendSuccess(res, users.map(normalizeProfile));
    } catch (error) {
        console.error("Failed to fetch chat members:", error);
        return sendError(res, "Failed to fetch chat members", 500);
    }
};

export const createChatMessage = async (req, res) => {
    try {
        console.log('[Chat] Message request body:', JSON.stringify(req.body));
        const validated = createMessageSchema.parse(req.body ?? {});
        const content = String(validated.content || "").trim();
        const chatId = normalizeChatId(validated.chatId, req);
        const replyTo = validated.replyTo ? String(validated.replyTo).trim() : null;
        const attachments = validated.attachments || [];
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userDetails: true,
                enrollments: {
                    select: { grade: true },
                    take: 5,
                },
                roles: {
                    select: {
                        role: {
                            select: { name: true },
                        },
                    },
                },
            }
        });

        if (!user) return sendError(res, "User not found", 404);
        const profile = normalizeProfile(user);

        let parentMessage = null;
        if (replyTo) {
            parentMessage = await prisma.chatMessage.findUnique({
                where: { id: replyTo },
                select: {
                    id: true,
                    chatId: true,
                    userId: true,
                },
            });
            if (!parentMessage) return sendError(res, "Reply target was not found", 404);
            if (parentMessage.chatId !== chatId) {
                return sendError(res, "Replies must stay within the same chat room", 400);
            }
        }

        const mentionTargets = await resolveMentionTargets({
            chatId,
            collegeId: req.user?.collegeId,
            mentions: validated.mentions,
            mentionedUserIds: validated.mentionedUserIds,
            actorUserId: userId,
        });

        const mentions = mentionTargets.map((target) => target.username.toLowerCase());
        const mentionedUserIds = mentionTargets.map((target) => target.id);

        const message = await prisma.chatMessage.create({
            data: {
                content,
                chatId,
                userId,
                username: profile.username,
                displayName: profile.displayName,
                avatar: profile.avatar,
                role: profile.type,
                mentions,
                mentionedUserIds,
                replyTo,
                attachments
            }
        });

        await dispatchMentionNotifications({
            actor: profile,
            chatId,
            message,
            mentionTargets,
            replyTargetUserId: parentMessage?.userId || null,
        });

        return sendSuccess(res, message, "Message sent", 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return sendError(
                res,
                "Validation failed",
                400,
                error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
            );
        }
        console.error("Failed to create chat message:", error);
        return sendError(res, "Failed to send message", 500);
    }
};

export const updateChatMessageById = async (req, res) => {
    try {
        const messageId = String(req.params.id || "");
        const validated = updateMessageSchema.parse(req.body ?? {});

        if (!messageId) return sendError(res, "Message ID is required", 400);

        const existingMessage = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            select: {
                id: true,
                userId: true,
                chatId: true,
            },
        });
        if (!existingMessage) return sendError(res, "Message not found", 404);
        if (existingMessage.userId !== req.user.id) {
            return sendError(res, "You can only edit your own messages", 403);
        }

        const mentionTargets = await resolveMentionTargets({
            chatId: existingMessage.chatId,
            collegeId: req.user?.collegeId,
            mentions: validated.mentions,
            mentionedUserIds: validated.mentionedUserIds,
            actorUserId: req.user.id,
        });

        const updated = await prisma.chatMessage.update({
            where: { id: messageId },
            data: {
                content: validated.content,
                mentions: mentionTargets.map((target) => target.username.toLowerCase()),
                mentionedUserIds: mentionTargets.map((target) => target.id),
                updatedAt: new Date(),
            },
        });

        return sendSuccess(res, updated, "Message updated");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return sendError(
                res,
                "Validation failed",
                400,
                error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
            );
        }
        console.error("Failed to update chat message:", error);
        return sendError(res, "Failed to update message", 500);
    }
};

export const deleteChatMessageById = async (req, res) => {
    try {
        const messageId = String(req.params.id || "");
        if (!messageId) return sendError(res, "Message ID is required", 400);

        const existingMessage = await prisma.chatMessage.findUnique({
            where: { id: messageId },
            select: {
                id: true,
                userId: true,
            },
        });
        if (!existingMessage) return sendError(res, "Message not found", 404);
        if (existingMessage.userId !== req.user.id) {
            return sendError(res, "You can only delete your own messages", 403);
        }

        await prisma.chatMessage.delete({
            where: { id: messageId },
        });

        return sendSuccess(res, null, "Message deleted");
    } catch (error) {
        console.error("Failed to delete chat message:", error);
        return sendError(res, "Failed to delete message", 500);
    }
};

export const searchChatUsers = async (req, res) => {
    try {
        const query = String(req.query.q || req.query.query || "").trim();
        const chatId = normalizeChatId(req.query.chatId, req);
        const limit = Math.min(Math.max(parseInt(String(req.query.limit || "10"), 10), 1), 50);

        const where = {
            ...(query ? { username: { contains: query, mode: "insensitive" } } : {}),
            ...(req.user?.collegeId ? { collegeId: req.user.collegeId } : {}),
        };

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        displayName: true,
                    }
                }
            },
            orderBy: { username: "asc" },
            take: limit,
        });

        const results = users.map((user) => ({
            id: user.id,
            username: user.username,
            avatar: user.userDetails?.avatar || "",
            displayName: user.userDetails?.displayName || `${user.userDetails?.firstName || ""} ${user.userDetails?.lastName || ""}`.trim() || user.username,
        }));

        return sendSuccess(res, results);
    } catch (error) {
        console.error("Failed to search chat users:", error);
        return sendError(res, "Failed to search users", 500);
    }
};

export const getMyChatProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return sendError(res, "Unauthorized", 401);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                type: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        sex: true
                    }
                },
                enrollments: {
                    select: { grade: true },
                    take: 5
                },
                roles: {
                    select: {
                        role: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!user) return sendError(res, "User not found", 404);
        return sendSuccess(res, normalizeProfile(user));
    } catch (error) {
        console.error("Failed to fetch my chat profile:", error);
        return sendError(res, "Failed to fetch profile", 500);
    }
};
