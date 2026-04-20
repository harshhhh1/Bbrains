import {
    getUsersByRole,
    getUserByName,
    createTeacher,
    createStudent,
    createManager,
    createAdmin,
    deleteUser as deleteManagedUser,
    getUserDetailsByID,
    getUserSummaryByID,
    findUserByEmail,
    findUserByUsername
} from "./user.service.js";
import { processCSVFile, validateCSVData, generateUsername, generatePassword } from "../../utils/csvProcessor.js";
import bcrypt from "bcrypt";
import { sendSuccess, sendPaginated, sendError, sendCreated } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import prisma from "../../utils/prisma.js";
import { z } from "zod";
import crypto from "crypto";
import fs from "fs";

// Zod Schemas
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

const resolveCollegeId = async (requestedCollegeId, fallbackCollegeId, userType = null) => {
    if (
        userType !== 'superadmin' &&
        userType !== 'bbrains_official' &&
        requestedCollegeId !== undefined &&
        requestedCollegeId !== null &&
        fallbackCollegeId &&
        Number(requestedCollegeId) !== Number(fallbackCollegeId)
    ) {
        throw new Error('You can only manage users within your own college');
    }

    const collegeId = requestedCollegeId ?? fallbackCollegeId;

    if (!collegeId) {
        throw new Error('No college is associated with the current admin account');
    }

    const college = await prisma.college.findUnique({
        where: { id: Number(collegeId) },
        select: { id: true }
    });

    if (!college) {
        throw new Error(`College ${collegeId} does not exist`);
    }

    return college.id;
};

const findCourseInCollege = async (tx, courseId, collegeId, notFoundMessage) => {
    const course = await tx.course.findUnique({
        where: { id: Number(courseId) },
        select: {
            id: true,
            collegeId: true,
            classTeacherId: true,
        }
    });

    if (!course || Number(course.collegeId ?? 0) !== Number(collegeId)) {
        throw new Error(notFoundMessage);
    }

    return course;
};

const syncTeacherClassTeacherAssignment = async (tx, teacherId, nextCourseId, collegeId) => {
    await tx.course.updateMany({
        where: { classTeacherId: teacherId },
        data: { classTeacherId: null }
    });

    if (!nextCourseId) return;

    const course = await findCourseInCollege(tx, nextCourseId, collegeId, 'Selected class was not found for this college');

    if (course.classTeacherId && course.classTeacherId !== teacherId) {
        throw new Error('This class already has a class teacher assigned');
    }

    await tx.course.update({
        where: { id: course.id },
        data: {
            classTeacherId: teacherId,
        }
    });
};

// GET /users/me - Get own profile
export const getMe = async (req, res) => {
    try {
        const userData = await getUserDetailsByID(req.user.id);
        if (!userData) return sendError(res, 'User not found', 404);
        return sendSuccess(res, userData);
    } catch (error) {
        console.error('getMe error:', error);
        return sendError(res, `Failed to fetch profile: ${error.message}`, 500);
    }
};

// GET /users/:username - Get user by username
export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await prisma.user.findUnique({
            where: {
                username,
                collegeId: req.user.collegeId
            },
            select: {
                id: true,
                username: true,
                email: true,
                type: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                        sex: true,
                        dob: true,
                        phone: req.user.type === 'student' ? false : true
                    }
                },
                xp: { select: { xp: true, level: true } }
            }
        });

        if (!user) return sendError(res, 'User not found', 404);
        return sendSuccess(res, user);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch user', 500);
    }
};

// GET /users/students
export const getStudents = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type);
        const result = await getUsersByRole('student', collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch students', 500);
    }
};

// GET /users/teachers
export const getTeachers = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type);
        const result = await getUsersByRole('teacher', collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch teachers', 500);
    }
};

// GET /users/staff
export const getStaff = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type);
        const result = await getUsersByRole('staff', collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch staff', 500);
    }
};

// GET /users/managers
export const getManagers = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type);
        const managers = await prisma.user.findMany({
            where: {
                collegeId,
                roles: {
                    some: {
                        role: {
                            name: {
                                contains: 'manager',
                                mode: 'insensitive'
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                type: true,
                userDetails: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        sex: true,
                        dob: true,
                        phone: true,
                        bio: true
                    }
                },
                wallet: {
                    select: {
                        id: true,
                        balance: true,
                    },
                },
                xp: {
                    select: {
                        xp: true,
                        level: true,
                    },
                },
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return sendSuccess(res, managers);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch managers', 500);
    }
};

// GET /users/admins
export const getAdmins = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type);
        const admins = await prisma.user.findMany({
            where: {
                collegeId,
                type: 'admin'
            },
            select: {
                id: true,
                username: true,
                email: true,
                type: true,
                userDetails: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        sex: true,
                        dob: true,
                        phone: true,
                        bio: true
                    }
                },
                wallet: {
                    select: {
                        id: true,
                        balance: true,
                    },
                },
                xp: {
                    select: {
                        xp: true,
                        level: true,
                    },
                },
                roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return sendSuccess(res, admins);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch admins', 500);
    }
};

// GET /users/students/:username
export const getStudentByUsername = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: req.params.username,
                type: 'student',
                collegeId: req.user.collegeId
            },
            select: {
                id: true, username: true, email: true, type: true,
                userDetails: true,
                enrollments: { include: { course: true } },
                xp: true
            }
        });
        if (!user) return sendError(res, 'Student not found', 404);
        return sendSuccess(res, user);
    } catch (error) {
        return sendError(res, 'Failed to fetch student', 500);
    }
};

// GET /users/teachers/:username
export const getTeacherByUsername = async (req, res) => {
    try {
        const selectFields = {
            id: true, username: true, email: true, type: true,
            userDetails: {
                select: {
                    avatar: true, firstName: true, lastName: true
                }
            }
        };

        // Teachers/admins see full profile
        if (req.user.type === 'teacher' || req.user.type === 'admin') {
            selectFields.userDetails = true;
        }

        const user = await prisma.user.findFirst({
            where: {
                username: req.params.username,
                type: 'teacher',
                collegeId: req.user.collegeId
            },
            select: selectFields
        });
        if (!user) return sendError(res, 'Teacher not found', 404);
        return sendSuccess(res, user);
    } catch (error) {
        return sendError(res, 'Failed to fetch teacher', 500);
    }
};

// POST /users/teachers — creates teacher directly in local DB
export const addTeacher = async (req, res) => {
    try {
        const validated = addTeacherSchema.parse(req.body);
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId);
        const [existingEmail, existingUsername] = await Promise.all([
            findUserByEmail(validated.email),
            findUserByUsername(validated.username),
        ]);
        if (existingEmail || existingUsername) return sendError(res, 'Username or email already exists', 409);

        const result = await createTeacher({
            ...validated,
            collegeId,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Teacher added');
        return sendCreated(res, result, 'Teacher account created successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Teacher Error:", error);
        return sendError(res, error?.message || 'Failed to add teacher', 500);
    }
};

// POST /users/students
export const addStudent = async (req, res) => {
    try {
        const validated = createStudentSchema.parse(req.body);
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId);
        const [existingEmail, existingUsername] = await Promise.all([
            findUserByEmail(validated.email),
            findUserByUsername(validated.username),
        ]);
        if (existingEmail || existingUsername) return sendError(res, 'Username or email already exists', 409);

        const result = await createStudent({
            ...validated,
            collegeId,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Student added');
        return sendCreated(res, result, 'Student account created successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Student Error:", error);
        return sendError(res, error?.message || 'Failed to add student', 500);
    }
};

// POST /users/managers
export const addManager = async (req, res) => {
    try {
        const validated = createManagerSchema.parse(req.body);
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId);
        const [existingEmail, existingUsername] = await Promise.all([
            findUserByEmail(validated.email),
            findUserByUsername(validated.username),
        ]);
        if (existingEmail || existingUsername) return sendError(res, 'Username or email already exists', 409);

        const result = await createManager({
            ...validated,
            collegeId,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Manager added');
        return sendCreated(res, result, 'Manager account created successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Manager Error:", error);
        return sendError(res, error?.message || 'Failed to add manager', 500);
    }
};

// POST /users/admins
export const addAdmin = async (req, res) => {
    try {
        const validated = createAdminSchema.parse(req.body);
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId, req.user.type);
        const [existingEmail, existingUsername] = await Promise.all([
            findUserByEmail(validated.email),
            findUserByUsername(validated.username),
        ]);
        if (existingEmail || existingUsername) return sendError(res, 'Username or email already exists', 409);

        const result = await createAdmin({
            ...validated,
            collegeId,
        });
        await createAuditLog(req.user.id, 'USER', 'CREATE', 'User', result.id, null, 'Admin added');
        return sendCreated(res, result, 'Admin account created successfully.');
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }
        if (error.code === 'P2002') return sendError(res, 'Username or email already exists', 409);
        console.error("Add Admin Error:", error);
        return sendError(res, error?.message || 'Failed to add admin', 500);
    }
};

// PUT /users/teachers/:id
export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                id,
                type: 'teacher',
                collegeId: req.user.collegeId,
            }
        });
        if (!user || user.type !== 'teacher') return sendError(res, 'Teacher not found', 404);

        const {
            firstName,
            lastName,
            sex,
            dob,
            phone,
            bio,
            collegeId,
            teacherSubjects,
            classTeacherCourseId,
        } = req.body;
        const effectiveCollegeId = collegeId !== undefined
            ? await resolveCollegeId(collegeId, req.user.collegeId)
            : user.collegeId;

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    ...(effectiveCollegeId ? { collegeId: Number(effectiveCollegeId) } : {}),
                    userDetails: {
                        upsert: {
                            create: {
                                firstName: firstName ?? '',
                                lastName: lastName ?? '',
                                sex: sex ?? 'other',
                                dob: dob ? new Date(dob) : new Date('2000-01-01'),
                                phone: phone ?? null,
                                bio: bio ?? null,
                                ...(teacherSubjects !== undefined ? { teacherSubjects } : {}),
                            },
                            update: {
                                ...(firstName !== undefined ? { firstName } : {}),
                                ...(lastName !== undefined ? { lastName } : {}),
                                ...(sex !== undefined ? { sex } : {}),
                                ...(dob !== undefined ? { dob: new Date(dob) } : {}),
                                ...(phone !== undefined ? { phone } : {}),
                                ...(bio !== undefined ? { bio } : {}),
                                ...(teacherSubjects !== undefined ? { teacherSubjects } : {}),
                            }
                        }
                    }
                }
            });

            if (classTeacherCourseId !== undefined) {
                await syncTeacherClassTeacherAssignment(tx, id, classTeacherCourseId || null, effectiveCollegeId);
            }
        });

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'User', id, { after: req.body });
        const updatedTeacher = await getUserSummaryByID(id);
        return sendSuccess(res, updatedTeacher, 'Teacher updated successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Teacher not found', 404);
        console.error(error);
        return sendError(res, error?.message || 'Failed to update teacher', 500);
    }
};

// PUT /users/students/:id
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findFirst({
            where: {
                id,
                type: 'student',
                collegeId: req.user.collegeId,
            }
        });
        if (!user || user.type !== 'student') return sendError(res, 'Student not found', 404);

        const {
            firstName,
            lastName,
            sex,
            dob,
            phone,
            bio,
            collegeId,
            classId,
        } = req.body;
        const effectiveCollegeId = collegeId !== undefined
            ? await resolveCollegeId(collegeId, req.user.collegeId)
            : user.collegeId;

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    ...(effectiveCollegeId ? { collegeId: Number(effectiveCollegeId) } : {}),
                    userDetails: {
                        upsert: {
                            create: {
                                firstName: firstName ?? '',
                                lastName: lastName ?? '',
                                sex: sex ?? 'other',
                                dob: dob ? new Date(dob) : new Date('2008-01-01'),
                                phone: phone ?? null,
                                bio: bio ?? null,
                            },
                            update: {
                                ...(firstName !== undefined ? { firstName } : {}),
                                ...(lastName !== undefined ? { lastName } : {}),
                                ...(sex !== undefined ? { sex } : {}),
                                ...(dob !== undefined ? { dob: new Date(dob) } : {}),
                                ...(phone !== undefined ? { phone } : {}),
                                ...(bio !== undefined ? { bio } : {}),
                            }
                        }
                    }
                }
            });

            if (classId !== undefined) {
                const nextCourseId = Number(classId);
                await findCourseInCollege(tx, nextCourseId, effectiveCollegeId, 'Selected class was not found for this college');

                await tx.enrollment.deleteMany({
                    where: { userId: id }
                });

                await tx.enrollment.create({
                    data: {
                        userId: id,
                        courseId: nextCourseId,
                    }
                });
            }
        });

        await createAuditLog(req.user.id, 'USER', 'UPDATE', 'User', id, { after: req.body });
        const updatedStudent = await getUserSummaryByID(id);
        return sendSuccess(res, updatedStudent, 'Student updated successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Student not found', 404);
        console.error(error);
        return sendError(res, error?.message || 'Failed to update student', 500);
    }
};

// DELETE /users/teachers/:id
export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user || user.type !== 'teacher') return sendError(res, 'Teacher not found', 404);

        await deleteManagedUser(id);
        await createAuditLog(req.user.id, 'USER', 'DELETE', 'User', id, null, 'Teacher removed');
        return sendSuccess(res, null, 'Teacher deleted successfully');
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to delete teacher', 500);
    }
};

// POST /users/batch-import — batch import users from CSV
export const batchImportUsers = async (req, res) => {
    // Only allow admin and manager to perform batch import
    if (!['admin', 'manager', 'superadmin'].includes(req.user.type)) {
        return sendError(res, 'Unauthorized: Insufficient permissions', 403);
    }

    try {
        // Check if file was uploaded
        if (!req.file) {
            return sendError(res, 'No file uploaded', 400);
        }

        // Validate file type
        if (req.file.mimetype !== 'text/csv' && req.file.originalname.split('.').pop() !== 'csv') {
            return sendError(res, 'Invalid file type. Please upload a CSV file.', 400);
        }

        // Process CSV file
        const csvData = await processCSVFile(req.file.path);

        // Validate required fields - only the essentials
        const requiredFields = [
            'firstname', 'lastname', 'email', 'type',
            'sex', 'dob', 'courseId'
        ];

        const validationResult = validateCSVData(csvData, requiredFields);
        if (!validationResult.isValid) {
            // Return first error found (stop on first error)
            const firstError = validationResult.errors[0];
            return sendError(res, firstError.message, 400, {
                row: firstError.row,
                field: firstError.field
            });
        }

        // Validate user type values
        const validTypes = ['student', 'teacher', 'manager'];
        const invalidTypeRow = csvData.find((row, index) => {
            if (!validTypes.includes(row.type)) {
                return { row: index + 1, field: 'type', message: `Invalid user type: ${row.type}. Must be one of: ${validTypes.join(', ')}` };
            }
            return null;
        });

        if (invalidTypeRow) {
            return sendError(res, invalidTypeRow.message, 400, {
                row: invalidTypeRow.row,
                field: invalidTypeRow.field
            });
        }

        // Validate date of birth format and age
        const dobError = csvData.find((row, index) => {
            const dob = row.dob;
            if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
                return { row: index + 1, field: 'dob', message: 'Invalid date format. Use YYYY-MM-DD' };
            }

            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 16) {
                return { row: index + 1, field: 'dob', message: 'User must be at least 16 years old' };
            }

            return null;
        });

        if (dobError) {
            return sendError(res, dobError.message, 400, {
                row: dobError.row,
                field: dobError.field
            });
        }

        // Validate email format
        const emailError = csvData.find((row, index) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
                return { row: index + 1, field: 'email', message: 'Invalid email format' };
            }
            return null;
        });

        if (emailError) {
            return sendError(res, emailError.message, 400, {
                row: emailError.row,
                field: emailError.field
            });
        }

        // Check for duplicate emails in CSV
        const emailMap = {};
        const duplicateEmailError = csvData.find((row, index) => {
            if (emailMap[row.email]) {
                return { row: index + 1, field: 'email', message: 'Duplicate email found in CSV' };
            }
            emailMap[row.email] = true;
            return null;
        });

        if (duplicateEmailError) {
            return sendError(res, duplicateEmailError.message, 400, {
                row: duplicateEmailError.row,
                field: duplicateEmailError.field
            });
        }

        // Process each row in transaction
        const results = {
            successCount: 0,
            errors: []
        };

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            try {
                await prisma.$transaction(async (tx) => {
                    // Check if email already exists in database
                    const existingUserByEmail = await tx.user.findUnique({
                        where: { email: row.email }
                    });

                    if (existingUserByEmail) {
                        throw new Error(`Email ${row.email} already exists`);
                    }

                    // Generate username and password
                    let username = generateUsername(row.firstname, row.dob);
                    const password = generatePassword(row.firstname, row.dob);

                    // Check if username already exists in database and make unique
                    let counter = 1;
                    let uniqueUsername = username;
                    while (await tx.user.findUnique({ where: { username: uniqueUsername } })) {
                        uniqueUsername = `${username}_${counter}`;
                        counter++;
                    }
                    username = uniqueUsername;

                    // Determine user ID: use CSV-provided user_id (any unique string) or generate UUID
                    let userId = row.user_id ? String(row.user_id).trim() : crypto.randomUUID();

                    // Ensure the provided user_id doesn't already exist
                    if (row.user_id) {
                        const existingById = await tx.user.findUnique({ where: { id: userId } });
                        if (existingById) {
                            throw new Error(`User ID "${userId}" already exists in the database`);
                        }
                    }

                    // Validate collegeId from request user
                    const collegeId = await resolveCollegeId(null, req.user.collegeId);

                    // Validate course exists and belongs to same college
                    const course = await findCourseInCollege(tx, Number(row.courseId), collegeId, 'Selected course was not found for this college');

                    // Create Address record only if address fields present
                    let address = null;
                    if (row.addressLine1 && row.city && row.country) {
                        address = await tx.address.create({
                            data: {
                                addressLine1: row.addressLine1,
                                addressLine2: row.addressLine2 || null,
                                city: row.city,
                                state: row.state || null,
                                postalCode: row.postalCode || null,
                                country: row.country
                            }
                        });
                    }

                    // Create User record
                    const user = await tx.user.create({
                        data: {
                            id: userId,
                            email: row.email,
                            username: username,
                            password: await bcrypt.hash(password, 10),
                            type: row.type,
                            collegeId: collegeId,
                            ...(address ? { addresses: { connect: { id: address.id } } } : {})
                        }
                    });

                    // Create UserDetails record
                    await tx.userDetails.create({
                        data: {
                            userId: user.id,
                            firstName: row.firstname,
                            lastName: row.lastname,
                            sex: row.sex,
                            dob: new Date(row.dob),
                            phone: row.phone || null,
                            ...(address ? { addressId: address.id } : {})
                            // teacherSubjects, bio, middlename will be null/default
                        }
                    });

                    // Create Wallet record with 5000 starting balance (use upsert to handle duplicates)
                    await tx.wallet.upsert({
                        where: { userId: user.id },
                        update: {},
                        create: {
                            id: crypto.randomUUID(),
                            userId: user.id,
                            balance: 5000,
                            heldBalance: 0
                        }
                    });

                    // Create Enrollment record
                    await tx.enrollment.create({
                        data: {
                            userId: user.id,
                            courseId: Number(row.courseId),
                            enrolledAt: new Date()
                        }
                    });

                    results.successCount++;
                });
            } catch (error) {
                // Stop processing on first error as per requirements
                results.errors.push({
                    row: i + 1,
                    message: error.message,
                    field: error.field || 'unknown'
                });

                // Return error immediately (stop on first error)
                return sendError(res, `Error processing row ${i + 1}: ${error.message}`, 400, {
                    row: i + 1,
                    field: error.field || 'unknown'
                });
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Return success response
        return sendSuccess(res, {
            message: `Successfully imported ${results.successCount} users`,
            count: results.successCount
        });

    } catch (error) {
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error("Batch Import Error:", error);

        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }

        return sendError(res, error.message || 'Failed to import users', 500);
    }
};

// GET /users/search?name=...
export const searchUser = async (req, res) => {
    try {
        const query = String(req.query.q || req.query.name || "").trim();
        const channelId = String(req.query.channelId || "").trim() || (req.user.collegeId ? `global_${req.user.collegeId}` : "default");

        if (!query) {
            return sendSuccess(res, []);
        }

        const recentChatMembers = await prisma.chatMessage.findMany({
            where: { chatId: channelId },
            select: {
                userId: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            distinct: ["userId"],
        });

        const activityRank = new Map(
            recentChatMembers.map((entry, index) => [entry.userId, index])
        );

        const users = await prisma.user.findMany({
            where: {
                collegeId: req.user.collegeId,
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        userDetails: {
                            is: {
                                firstName: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                    {
                        userDetails: {
                            is: {
                                lastName: {
                                    contains: query,
                                    mode: "insensitive",
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                username: true,
                userDetails: {
                    select: {
                        avatar: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            take: 20,
        });

        const results = users
            .map((user) => ({
                id: user.id,
                username: user.username,
                displayName: `${user.userDetails?.firstName || ""} ${user.userDetails?.lastName || ""}`.trim() || user.username,
                avatarUrl: user.userDetails?.avatar || "",
                rank: activityRank.has(user.id) ? activityRank.get(user.id) : Number.MAX_SAFE_INTEGER,
            }))
            .sort((a, b) => {
                if (a.rank !== b.rank) return a.rank - b.rank;
                return a.username.localeCompare(b.username);
            })
            .slice(0, 8)
            .map(({ rank: _rank, ...user }) => user);

        return sendSuccess(res, results);
    } catch (error) {
        return sendError(res, 'Search failed', 500);
    }
};
export const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username || username.trim().length <= 2) {
            return sendSuccess(res, { available: false, message: 'Username must be more than 2 characters' });
        }

        const existing = await findUserByUsername(username);

        // If username exists and belongs to someone else, it's NOT available
        if (existing && existing.id !== req.user.id) {
            return sendSuccess(res, { available: false, message: 'Username is already taken' });
        }

        return sendSuccess(res, { available: true });
    } catch (error) {
        console.error('checkUsernameAvailability error:', error);
        return sendError(res, 'Failed to check username', 500);
    }
};
