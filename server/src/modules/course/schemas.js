import { z } from 'zod';

const timetableEntrySchema = z.object({
    day: z.string().min(1).max(20),
    subject: z.string().min(1).max(100),
    startTime: z.string().min(1).max(10),
    endTime: z.string().min(1).max(10),
    room: z.string().max(50).optional().nullable(),
});

const subjectProgressEntrySchema = z.object({
    subject: z.string().min(1).max(100),
    totalChapters: z.coerce.number().int().min(0).optional().default(0),
    completedChapters: z.coerce.number().int().min(0).optional().default(0),
    teacherId: z.string().optional(),
}).refine(
    (entry) => entry.completedChapters <= entry.totalChapters,
    {
        message: 'Completed chapters cannot exceed total chapters',
        path: ['completedChapters'],
    }
);

const createCourseSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional(),
    standard: z.string().min(1).max(50),
    subjects: z.array(z.string().min(1).max(100)).optional(),
    semesters: z.array(z.object({
        semesterNumber: z.number().int().min(1),
        subjects: z.array(z.object({
            name: z.string().min(1).max(100),
            code: z.string().min(1).max(20),
            examTotalMarks: z.number().positive()
        })).min(1)
    })).optional(),
    subjectProgress: z.array(subjectProgressEntrySchema).optional(),
    feePerStudent: z.coerce.number().min(0).optional(),
    durationValue: z.coerce.number().int().positive().optional(),
    durationUnit: z.enum(['months', 'years']).optional(),
    studentCapacity: z.coerce.number().int().min(1).optional(),
    timetable: z.array(timetableEntrySchema).optional().nullable(),
});

const updateCourseSchema = createCourseSchema.partial();

export {
    timetableEntrySchema,
    subjectProgressEntrySchema,
    createCourseSchema,
    updateCourseSchema
};