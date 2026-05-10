import { z } from 'zod';

const examResultSchema = z.object({
    studentId: z.string().uuid(),
    marksObtained: z.coerce.number().min(0),
    remark: z.string().trim().max(255).optional().or(z.literal('')),
});

const examSchema = z.object({
    courseId: z.coerce.number().int().positive(),
    semesterNumber: z.coerce.number().int().min(1),
    subjectCode: z.string().trim().min(1).max(50),
    topic: z.string().trim().min(1).max(150),
    examDate: z.string().min(1),
    studentId: z.string().uuid().optional(),
    marksObtained: z.coerce.number().min(0).optional(),
    remark: z.string().trim().max(255).optional().or(z.literal('')),
});

export {
    examResultSchema,
    examSchema
};