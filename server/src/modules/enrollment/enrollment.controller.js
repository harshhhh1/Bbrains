import { z } from 'zod';
import {
    enrollUser, enrollBulk, getMyEnrollments, getCourseEnrollments,
    unenrollUser, updateEnrollmentGrade
} from './enrollment.service.js';

import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

const enrollSchema = z.object({
    userId: z.string().optional(),
    courseId: z.number().int().positive()
});


const gradeSchema = z.object({
    grade: z.string().max(5)
});

const enrollBulkSchema = z.object({
    userIds: z.array(z.string()),
    courseId: z.number().int().positive()
});



// POST /enrollments
export const enroll = async (req, res) => {
    try {
        const validated = enrollSchema.parse(req.body);
        const userId = validated.userId || req.user.id;

        // Only teachers/admins can enroll other students
        if (validated.userId && validated.userId !== req.user.id) {
            if (req.user.type !== 'teacher' && req.user.type !== 'admin') {
                return sendError(res, 'Not authorized to enroll other users', 403);
            }
        }

        const enrollment = await enrollUser(userId, validated.courseId);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Enrollment', `${userId}-${validated.courseId}`);
        return sendCreated(res, enrollment, 'Enrolled successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, (error.issues || error.errors || []).map(e => ({ field: e.path.join('.'), message: e.message })));
        if (error.message === 'Already enrolled in this course') return sendError(res, error.message, 409);

        console.error(error);
        return sendError(res, 'Failed to enroll', 500);
    }
};

// POST /enrollments/bulk
export const enrollBulkUsers = async (req, res) => {
    try {
        const validated = enrollBulkSchema.parse(req.body);

        // Only teachers/admins can enroll other students
        if (req.user.type !== 'teacher' && req.user.type !== 'admin' && req.user.type !== 'superadmin' && req.user.type !== 'manager') {
            return sendError(res, 'Not authorized to enroll other users', 403);
        }

        const result = await enrollBulk(validated.userIds, validated.courseId);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'BulkEnrollment', `Course:${validated.courseId}-UsersCount:${validated.userIds.length}`);
        return sendCreated(res, result, `Successfully enrolled ${result.count} users`);
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, (error.issues || error.errors || []).map(e => ({ field: e.path.join('.'), message: e.message })));
        console.error(error);

        return sendError(res, 'Failed to enroll in bulk', 500);
    }
};


// GET /enrollments/me
export const getEnrollments = async (req, res) => {
    try {
        const enrollments = await getMyEnrollments(req.user.id);
        return sendSuccess(res, enrollments);
    } catch (error) {
        return sendError(res, 'Failed to fetch enrollments', 500);
    }
};

// GET /enrollments/course/:courseId
export const getCourseEnrollmentsList = async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId);
        if (isNaN(courseId)) return sendError(res, 'Invalid course ID', 400);
        const enrollments = await getCourseEnrollments(courseId);
        return sendSuccess(res, enrollments);
    } catch (error) {
        return sendError(res, 'Failed to fetch enrollments', 500);
    }
};

// DELETE /enrollments/:userId/:courseId
export const unenroll = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        // Only self or authorized staff
        const isSelf = userId === req.user.id;
        const isStaff = ['admin', 'superadmin', 'manager', 'bbrains_official'].includes(req.user.type);

        if (!isSelf && !isStaff) {
            return sendError(res, 'Not authorized to unenroll this user', 403);
        }


        await unenrollUser(userId, parseInt(courseId));
        await createAuditLog(req.user.id, 'ACADEMIC', 'DELETE', 'Enrollment', `${userId}-${courseId}`);
        return sendSuccess(res, null, 'Unenrolled successfully');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Enrollment not found', 404);
        return sendError(res, 'Failed to unenroll', 500);
    }
};

// PUT /enrollments/:userId/:courseId/grade
export const updateGrade = async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const validated = gradeSchema.parse(req.body);

        const enrollment = await updateEnrollmentGrade(userId, parseInt(courseId), validated.grade);
        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Enrollment', `${userId}-${courseId}`, { grade: validated.grade });
        return sendSuccess(res, enrollment, 'Grade updated successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, (error.issues || []).map(e => ({ field: e.path.join('.'), message: e.message })));
        if (error.code === 'P2025') return sendError(res, 'Enrollment not found', 404);
        return sendError(res, 'Failed to update grade', 500);
    }
};
