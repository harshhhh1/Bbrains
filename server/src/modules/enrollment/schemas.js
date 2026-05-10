import { z } from 'zod';

const enrollSchema = z.object({
    userId: z.string().optional(),
    courseId: z.number().int().positive()
});

const gradeEnrollmentSchema = z.object({
    grade: z.string().max(5)
});

const enrollBulkSchema = z.object({
    userIds: z.array(z.string()),
    courseId: z.number().int().positive()
});

export {
    enrollSchema,
    gradeEnrollmentSchema,
    enrollBulkSchema
};