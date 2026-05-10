import { z } from "zod";

const MAX_CHAT_ID_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;

const attachmentSchema = z.object({
    url: z.string().url().max(2000),
    type: z.string().min(1).max(120),
    name: z.string().max(255).optional(),
});

const createMessageSchema = z.object({
    content: z.string().max(MAX_MESSAGE_LENGTH).optional().default(""),
    chatId: z.string().trim().min(1).max(MAX_CHAT_ID_LENGTH).optional(),
    mentions: z.array(z.string().trim().min(1).max(64)).max(50).optional(),
    mentionedUserIds: z.array(z.string().trim().min(1).max(128)).max(50).optional(),
    replyTo: z.string().trim().min(1).max(100).optional().nullable(),
    attachments: z.array(attachmentSchema).max(10).optional(),
}).superRefine((payload, ctx) => {
    const hasText = String(payload.content || "").trim().length > 0;
    const hasAttachments = Array.isArray(payload.attachments) && payload.attachments.length > 0;

    if (!hasText && !hasAttachments) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["content"],
            message: "Message must include text or at least one attachment",
        });
    }
});

const updateMessageSchema = z.object({
    content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
    mentions: z.array(z.string().trim().min(1).max(64)).max(50).optional(),
    mentionedUserIds: z.array(z.string().trim().min(1).max(128)).max(50).optional(),
});

export {
    attachmentSchema,
    createMessageSchema,
    updateMessageSchema,
    MAX_CHAT_ID_LENGTH,
    MAX_MESSAGE_LENGTH
};