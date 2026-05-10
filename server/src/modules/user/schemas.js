import { z } from "zod";

const addTeacherSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().max(50),
    password: z.string().min(8),
    collegeId: z.number().int().positive().optional(),
    firstName: z.string().min(2).max(25),
    lastName: z.string().min(2).max(25),
    sex: z.enum(['male', 'female', 'other']),
    dob: z.string(),
    phone: z.string().max(15).optional(),
    teacherSubjects: z.array(z.string().min(1).max(100)).min(1),
    classTeacherCourseId: z.number().int().positive().optional().nullable(),
    roleIds: z.array(z.number()).optional(),
});

const createStudentSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().max(50),
    password: z.string().min(8),
    collegeId: z.number().int().positive().optional(),
    firstName: z.string().min(2).max(25),
    lastName: z.string().min(2).max(25),
    sex: z.enum(['male', 'female', 'other']),
    dob: z.string(),
    phone: z.string().max(15).optional(),
    classId: z.number().int().positive(),
    roleIds: z.array(z.number()).optional(),
});

const createManagerSchema = createStudentSchema.omit({
    classId: true,
}).extend({
    bio: z.string().max(500).optional(),
    roleIds: z.array(z.number()).optional(),
});

const createAdminSchema = createStudentSchema.omit({
    classId: true,
}).extend({
    bio: z.string().max(500).optional(),
    roleIds: z.array(z.number()).optional(),
});

const formatZodErrors = (error) => {
    const issues = Array.isArray(error?.issues)
        ? error.issues
        : Array.isArray(error?.errors)
            ? error.errors
            : [];

    return issues.map((entry) => ({
        field: Array.isArray(entry?.path) ? entry.path.join('.') : '',
        message: entry?.message || 'Invalid value',
    }));
};

export {
    addTeacherSchema,
    createStudentSchema,
    createManagerSchema,
    createAdminSchema,
    formatZodErrors
};