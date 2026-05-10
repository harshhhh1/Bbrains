import { z } from 'zod';

const assignmentSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    courseId: z.number().int().positive(),
    dueDate: z.string().optional(),
    file: z.string().url().optional(),
    rewardPoints: z.number().int().min(0).optional(),
    rewardCoins: z.number().int().min(0).optional(),
});

const submissionSchema = z.object({
    assignmentId: z.number().int().positive(),
    content: z.string().optional(),
    fileUrl: z.string().url(),
}).refine((value) => Boolean(value.fileUrl), {
    message: "A file upload is required",
    path: ["fileUrl"],
});

const submissionReviewSchema = z.object({
    reviewStatus: z.enum(["completed", "incomplete", "rework"]),
    reviewRemark: z.string().max(255).optional().nullable(),
});

const announcementSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    image: z.string().url().optional(),
    isGlobal: z.boolean().optional(),
    courseId: z.number().int().positive().optional()
});

const updateSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    courseId: z.number().int().positive().optional(),
    dueDate: z.string().optional(),
    file: z.string().url().optional(),
    rewardPoints: z.number().int().min(0).optional(),
    rewardCoins: z.number().int().min(0).optional(),
});

export {
    assignmentSchema,
    submissionSchema,
    submissionReviewSchema,
    announcementSchema,
    updateSchema
};