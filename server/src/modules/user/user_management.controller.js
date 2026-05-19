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
import { resolveCollegeId } from "../../utils/collegeUtils.js";
import { processCSVFile, validateCSVData, generateUsername, generatePassword } from "../../utils/csvProcessor.js";
import bcrypt from "bcrypt";
import { sendSuccess, sendPaginated, sendError, sendCreated } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import prisma from "../../utils/prisma.js";
import { z } from "zod";
import crypto from "crypto";
import fs from "fs";
import {
    addTeacherSchema,
    createStudentSchema,
    createManagerSchema,
    createAdminSchema,
    formatZodErrors
} from "./schemas.js";
import {
    findCourseInCollege,
    ensureRoleByNameInternal,
    grantStudentPermissionsToRole,
    syncTeacherClassTeacherAssignment
} from "./helpers.js";

// GET /users/me - Get own profile
export const getMe = async (req, res) => {
    try {
        const userData = await getUserDetailsByID(req.user.id);
        if (!userData) return sendError(res, 'User not found', 404);

        // Handle impersonation overrides
        if (req.user.isImpersonating) {
            const college = await prisma.college.findUnique({
                where: { id: req.user.collegeId },
                select: { id: true, name: true, regNo: true }
            });
            if (college) {
                userData.collegeId = college.id;
                userData.college = college;
                userData.type = req.user.originalType || userData.type; // Preserve superadmin status
                userData.isImpersonating = true;
                userData.originalType = req.user.originalType;
                // Add admin role to roles array for frontend sidebar logic
                if (!userData.roles) userData.roles = [];
                userData.roles = [{ role: { name: 'Admin' } }];
            }
        }

        return sendSuccess(res, userData);
    } catch (error) {
        console.error('getMe error:', error);
        return sendError(res, `Failed to fetch profile: ${error.message}`, 500);
    }
};

// GET /users/permissions - Get current user's permissions
export const getMyPermissions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user's roles and permissions
        const userRoles = await prisma.userRoles.findMany({
            where: { userId },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        const activeRoles = userRoles.map(ur => ur.role);
        const activeKeys = new Set();

        activeRoles.forEach(role => {
            if (role?.permissions) {
                role.permissions.forEach(rp => {
                    if (rp.enabled && rp.permission?.key) {
                        activeKeys.add(rp.permission.key);
                    }
                });
            }
        });

        return sendSuccess(res, {
            roles: activeRoles,
            permissions: Array.from(activeKeys)
        });
    } catch (error) {
        console.error('getMyPermissions error:', error);
        return sendError(res, 'Failed to fetch permissions', 500);
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
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
        const result = await getUsersByRole('student', collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch students', 500);
    }
};

// GET /users/teachers
export const getTeachers = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
        const result = await getUsersByRole('teacher', collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch teachers', 500);
    }
};

// GET /users/staff
export const getStaff = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
        const result = await getUsersByRole('staff', collegeId);
        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, error.message || 'Failed to fetch staff', 500);
    }
};

// GET /users/managers
export const getManagers = async (req, res) => {
    try {
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
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
        const collegeId = await resolveCollegeId(req.query.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
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
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
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
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
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
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
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
        const collegeId = await resolveCollegeId(validated.collegeId, req.user.collegeId, req.user.type, req.user.originalType);
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
                ...(req.user.type !== 'superadmin' && req.user.originalType !== 'superadmin'
                    ? { collegeId: req.user.collegeId }
                    : {}),
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
            ? await resolveCollegeId(collegeId, req.user.collegeId, req.user.type, req.user.originalType)
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
                ...(req.user.type !== 'superadmin' && req.user.originalType !== 'superadmin'
                    ? { collegeId: req.user.collegeId }
                    : {}),
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
            ? await resolveCollegeId(collegeId, req.user.collegeId, req.user.type, req.user.originalType)
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
            'sex', 'dob'
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

        // Validate user type values - map anything other than known types to 'staff' or similar
        const VALID_ENUM_TYPES = ['student', 'teacher', 'admin', 'staff', 'superadmin'];
        // We still use validTypes for basic structural validation if needed, 
        // but the user wants to allow "any other role" too.

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

                    // Determine user ID: use CSV-provided id or user_id (any unique string) or generate UUID
                    const providedId = row.id || row.user_id;
                    let userId = providedId ? String(providedId).trim() : crypto.randomUUID();

                    // Ensure the provided ID doesn't already exist
                    if (providedId) {
                        const existingById = await tx.user.findUnique({ where: { id: userId } });
                        if (existingById) {
                            throw new Error(`User ID "${userId}" already exists in the database`);
                        }
                    }

                    // Validate collegeId from request user
                    const collegeId = await resolveCollegeId(null, req.user.collegeId, req.user.type, req.user.originalType);
                    if (!collegeId) {
                        throw new Error('Please impersonate a college first before importing users');
                    }

                    // Validate course exists and belongs to same college
                    let course = null;
                    if (row.courseid && String(row.courseid).trim() !== "") {
                        course = await findCourseInCollege(tx, Number(row.courseid), collegeId, 'Selected course was not found for this college');
                    }

                    // Create Address record only if address fields present
                    let address = null;
                    if (row.addressline1 && row.city && row.country) {
                        address = await tx.address.create({
                            data: {
                                addressLine1: row.addressline1,
                                addressLine2: row.addressline2 || null,
                                city: row.city,
                                state: row.state || null,
                                postalCode: row.postalCode || null,
                                country: row.country
                            }
                        });
                    }

                    // Map row.type to a valid UserRole enum value
                    const rawType = (row.type || 'student').toLowerCase();
                    let enumType = 'student';
                    if (rawType === 'teacher') enumType = 'teacher';
                    else if (rawType === 'admin') enumType = 'admin';
                    else if (rawType === 'manager' || rawType === 'staff') enumType = 'staff';
                    else if (VALID_ENUM_TYPES.includes(rawType)) enumType = rawType;
                    else enumType = 'staff'; // Default for unknown roles

                    // Create User record
                    const user = await tx.user.create({
                        data: {
                            id: userId,
                            email: row.email,
                            username: username,
                            password: await bcrypt.hash(password, 10),
                            type: enumType,
                            collegeId: collegeId,
                            ...(address ? { addresses: { connect: { id: address.id } } } : {})
                        }
                    });

                    // Determine Role mapping
                    let roleName = rawType.charAt(0).toUpperCase() + rawType.slice(1);
                    if (rawType === 'manager') roleName = 'Manager';

                    // Ensure the Role exists in the DB
                    const { role, isNew } = await ensureRoleByNameInternal(tx, roleName, `${roleName} access`, collegeId);

                    // Assign the role to the user
                    await tx.userRoles.create({
                        data: {
                            userId: user.id,
                            roleId: role.id
                        }
                    });

                    // If it's a new or unknown role (not teacher/student/manager), grant student permissions
                    if (isNew && !['teacher', 'student', 'manager'].includes(rawType)) {
                        await grantStudentPermissionsToRole(tx, role.id);
                    }

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

                    // If student, create Enrollment record
                    if (enumType === 'student') {
                        if (course) {
                            await tx.enrollment.create({
                                data: {
                                    userId: user.id,
                                    courseId: course.id,
                                    enrolledAt: new Date()
                                }
                            });
                        }
                    }
                    // If teacher, try to assign as class teacher if course has none
                    else if (enumType === 'teacher' && course && !course.classTeacherId) {
                        await tx.course.update({
                            where: { id: course.id },
                            data: { classTeacherId: user.id }
                        });
                    }

                    // Initialize XP record
                    await tx.xp.upsert({
                        where: { userId: user.id },
                        update: {},
                        create: {
                            userId: user.id,
                            xp: 0,
                            level: 1
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

        // Return success response
        return sendSuccess(res, {
            message: `Successfully imported ${results.successCount} users`,
            count: results.successCount
        });

    } catch (error) {
        console.error("Batch Import Error:", error);

        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }

        return sendError(res, error.message || 'Failed to import users', 500);
    } finally {
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error("Failed to delete temp CSV file:", unlinkError);
            }
        }
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

/**
 * Temporary utility to fix users who were imported without proper roles.
 * Scans for teachers and students and ensures they have the correct role assigned.
 */
export const fixMissingRoles = async (req, res) => {
    try {
        const usersWithoutRoles = await prisma.user.findMany({
            where: {
                roles: { none: {} },
                type: { in: ['teacher', 'student'] }
            }
        });

        let count = 0;
        await prisma.$transaction(async (tx) => {
            for (const user of usersWithoutRoles) {
                const roleName = user.type.charAt(0).toUpperCase() + user.type.slice(1);
                const { role } = await ensureRoleByNameInternal(tx, roleName, `${roleName} access`, user.collegeId);

                await tx.userRoles.create({
                    data: {
                        userId: user.id,
                        roleId: role.id
                    }
                });
                count++;
            }
        });

        return sendSuccess(res, { count }, `Successfully fixed roles for ${count} users.`);
    } catch (error) {
        console.error('fixMissingRoles error:', error);
        return sendError(res, 'Failed to fix roles', 500);
    }
};
