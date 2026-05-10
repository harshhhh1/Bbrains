import { z } from 'zod';

const assessmentResultSchema = z.object({
    studentId: z.string().uuid(),
    marksObtained: z.coerce.number().min(0),
    remark: z.string().trim().max(255).optional().or(z.literal('')),
});

const assessmentSchema = z.object({
    courseId: z.coerce.number().int().positive(),
    subject: z.string().trim().min(1).max(100),
    topic: z.string().trim().min(1).max(150),
    assessmentType: z.enum(['test', 'exam']),
    assessmentDate: z.string().min(1),
    totalMarks: z.coerce.number().positive(),
    results: z.array(assessmentResultSchema).min(1),
});

export {
    assessmentResultSchema,
    assessmentSchema
};