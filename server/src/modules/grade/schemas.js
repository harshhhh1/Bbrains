import { z } from 'zod';

const gradeSchema = z.object({
    userId: z.string().uuid(),
    assignmentId: z.number().int().positive(),
    grade: z.string().max(5)
});

const updateGradeSchema = z.object({
    grade: z.string().max(5)
});

export {
    gradeSchema,
    updateGradeSchema
};