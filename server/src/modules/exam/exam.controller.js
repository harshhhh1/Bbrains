import { z } from 'zod';
import prisma from '../../utils/prisma.js';
import {
    createExamResult,
    createExamWithResult,
    getAllExamResults,
    getCourseSemesters,
    getExamById,
    getExamSetup,
    getStudentExamResults,
    getTeacherExams,
    updateExamWithResult,
} from './exam.service.js';
import { createAuditLog } from '../../utils/auditLog.js';
import { sendCreated, sendError, sendSuccess } from '../../utils/response.js';
import { examResultSchema, examSchema } from './schemas.js';

const getStatusCode = (error) => {
    if (typeof error?.statusCode === 'number') return error.statusCode;
    return 500;
};

const getErrorMessage = (error, fallback) => {
    if (typeof error?.message === 'string' && error.message.trim()) return error.message;
    return fallback;
};

export const getExamSetupHandler = async (req, res) => {
    try {
        const courseId = req.query.courseId ? Number(req.query.courseId) : null;
        const setup = await getExamSetup(req.user, courseId);
        return sendSuccess(res, setup);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to load exam setup'), getStatusCode(error));
    }
};

export const getCourseSemestersHandler = async (req, res) => {
    try {
        const courseId = Number(req.params.courseId);
        const semesters = await getCourseSemesters(courseId);
        return sendSuccess(res, semesters);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch course semesters'), getStatusCode(error));
    }
};

export const createExamHandler = async (req, res) => {
    try {
        const validated = examSchema.parse(req.body);
        const exam = await createExamWithResult(req.user.id, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'Exam', exam.id, {
            courseId: validated.courseId,
            semesterNumber: validated.semesterNumber,
            subjectCode: validated.subjectCode,
            topic: validated.topic,
        });
        return sendCreated(res, exam, 'Exam saved successfully');
    } catch (error) {
        if (error?.name === 'ZodError') {
            return sendError(
                res,
                'Validation failed',
                400,
                (error.issues || []).map((entry) => ({
                    field: entry.path.join('.'),
                    message: entry.message,
                }))
            );
        }

        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to save exam'), getStatusCode(error));
    }
};

export const updateExamHandler = async (req, res) => {
    try {
        const examId = Number(req.params.id);
        if (!Number.isInteger(examId) || examId <= 0) {
            return sendError(res, 'Invalid exam ID', 400);
        }

        const validated = examSchema.parse(req.body);
        const exam = await updateExamWithResult(examId, req.user, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'UPDATE', 'Exam', exam.id, {
            courseId: validated.courseId,
            semesterNumber: validated.semesterNumber,
            subjectCode: validated.subjectCode,
            topic: validated.topic,
        });
        return sendSuccess(res, exam, 'Exam updated successfully');
    } catch (error) {
        if (error?.name === 'ZodError') {
            return sendError(
                res,
                'Validation failed',
                400,
                (error.issues || []).map((entry) => ({
                    field: entry.path.join('.'),
                    message: entry.message,
                }))
            );
        }

        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to update exam'), getStatusCode(error));
    }
};

export const listTeacherExamsHandler = async (req, res) => {
    try {
        const exams = await getTeacherExams(req.user);
        return sendSuccess(res, exams);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch exams'), getStatusCode(error));
    }
};

export const getExamHandler = async (req, res) => {
    try {
        const examId = Number(req.params.id);
        if (!Number.isInteger(examId) || examId <= 0) {
            return sendError(res, 'Invalid exam ID', 400);
        }

        const exam = await getExamById(examId, req.user);
        return sendSuccess(res, exam);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch exam'), getStatusCode(error));
    }
};

export const getMyExamResultsHandler = async (req, res) => {
    try {
        const semester = req.query.semester ? Number(req.query.semester) : null;
        const results = await getStudentExamResults(req.user.id, semester);
        return sendSuccess(res, results);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch exam results'), getStatusCode(error));
    }
};

export const createExamResultHandler = async (req, res) => {
    try {
        const examId = Number(req.params.examId);
        if (!Number.isInteger(examId) || examId <= 0) {
            return sendError(res, 'Invalid exam ID', 400);
        }

        const validated = examResultSchema.parse(req.body);
        const result = await createExamResult(examId, req.user.id, validated);
        await createAuditLog(req.user.id, 'ACADEMIC', 'CREATE', 'ExamResult', result.id, {
            examId,
            studentId: validated.studentId,
            marksObtained: validated.marksObtained,
        });
        return sendCreated(res, result, 'Exam result saved successfully');
    } catch (error) {
        if (error?.name === 'ZodError') {
            return sendError(
                res,
                'Validation failed',
                400,
                (error.issues || []).map((entry) => ({
                    field: entry.path.join('.'),
                    message: entry.message,
                }))
            );
        }

        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to save exam result'), getStatusCode(error));
    }
};

export const getAllExamResultsHandler = async (req, res) => {
    try {
        const filters = {
            semesterNumber: req.query.semester,
            subjectCode: req.query.subjectCode,
        };
        const results = await getAllExamResults(req.user, filters);
        return sendSuccess(res, results);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch exam results'), getStatusCode(error));
    }
};

export const listCourseStudentsHandler = async (req, res) => {
    try {
        const courseId = Number(req.params.courseId);
        if (!Number.isInteger(courseId) || courseId <= 0) {
            return sendError(res, 'Invalid course ID', 400);
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            select: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        userDetails: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                user: { username: 'asc' },
            },
        });

        return sendSuccess(res, enrollments.map((e) => e.user));
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch students'), getStatusCode(error));
    }
};

export const saveStudentExamResultsHandler = async (req, res) => {
    try {
        const examId = Number(req.params.examId);
        if (!Number.isInteger(examId) || examId <= 0) {
            return sendError(res, 'Invalid exam ID', 400);
        }

        const validated = examResultSchema.parse(req.body);
        const result = await createExamResult(examId, req.user.id, validated);
        return sendSuccess(res, result, 'Result saved');
    } catch (error) {
        if (error?.name === 'ZodError') {
            return sendError(
                res,
                'Validation failed',
                400,
                (error.issues || []).map((entry) => ({
                    field: entry.path.join('.'),
                    message: entry.message,
                }))
            );
        }

        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to save result'), getStatusCode(error));
    }
};

export const getUpcomingExamsHandler = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alertWindowDays = 7;
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() + alertWindowDays);

        // For students: filter by their enrolled courses; for others: filter by college
        const user = req.user;
        let whereClause = {};

        if (user.type === 'student') {
            // Get the student's enrolled course IDs
            const enrollments = await prisma.enrollment.findMany({
                where: { userId: user.id },
                select: { courseId: true },
            });
            const courseIds = enrollments.map((e) => e.courseId);

            whereClause = {
                courseId: { in: courseIds },
                examDate: { gte: today, lte: cutoff },
            };
        } else {
            // Teachers/admins: filter by college
            whereClause = {
                course: user.collegeId ? { collegeId: user.collegeId } : undefined,
                examDate: { gte: today, lte: cutoff },
            };
        }

        const exams = await prisma.exam.findMany({
            where: whereClause,
            select: {
                id: true,
                courseId: true,
                semesterNumber: true,
                subjectName: true,
                subjectCode: true,
                topic: true,
                examDate: true,
                totalMarks: true,
                course: {
                    select: { id: true, name: true, standard: true },
                },
            },
            orderBy: { examDate: 'asc' },
        });

        return sendSuccess(res, exams);
    } catch (error) {
        console.error(error);
        return sendError(res, getErrorMessage(error, 'Failed to fetch upcoming exams'), getStatusCode(error));
    }
};
