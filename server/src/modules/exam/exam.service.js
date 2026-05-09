import prisma from '../../utils/prisma.js';
import { createNotification } from '../notification/notification.service.js';
import { AppError, ForbiddenError, NotFoundError } from '../../utils/errors.js';

const ensureExamModelsAvailable = (client = prisma) => {
    if (!client?.exam || !client?.examResult) {
        throw new AppError(
            "Exam models are not available in the running Prisma client. Apply the latest migration, run `npx prisma generate`, and restart the server.",
            500
        );
    }
};

const normalizeDate = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const parseSemesters = (semestersJson) => {
    if (!semestersJson) return [];
    try {
        const parsed = typeof semestersJson === 'string' ? JSON.parse(semestersJson) : semestersJson;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const findSubjectInSemester = (semesters, semesterNumber, subjectCode) => {
    const semester = semesters.find(s => s.semesterNumber === semesterNumber);
    if (!semester?.subjects) return null;
    return semester.subjects.find(sub => sub.code === subjectCode);
};

export const getCourseSemesters = async (courseId) => {
    const course = await prisma.course.findUnique({
        where: { id: Number(courseId) },
        select: {
            id: true,
            name: true,
            semesters: true,
        },
    });

    if (!course) {
        throw new NotFoundError('Course');
    }

    const semesters = parseSemesters(course.semesters);
    return semesters;
};

const getEnrolledStudents = async (courseId) => {
    const enrollments = await prisma.enrollment.findMany({
        where: {
            courseId: Number(courseId),
        },
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
            user: {
                username: 'asc',
            },
        },
    });

    return enrollments.map(e => e.user);
};

const validateSemesterAndSubject = (course, semesterNumber, subjectCode) => {
    const semesters = parseSemesters(course.semesters);
    
    if (!semesters.length) {
        throw new AppError('Course has no semesters defined', 400);
    }

    const semester = semesters.find(s => s.semesterNumber === semesterNumber);
    if (!semester) {
        throw new AppError(`Semester ${semesterNumber} does not exist for this course`, 400);
    }

    const subject = findSubjectInSemester(semesters, semesterNumber, subjectCode);
    if (!subject) {
        throw new AppError(`Subject ${subjectCode} not found in semester ${semesterNumber}`, 400);
    }

    return subject;
};

const examInclude = {
    course: {
        select: {
            id: true,
            name: true,
            standard: true,
            collegeId: true,
        },
    },
    createdBy: {
        select: {
            id: true,
            username: true,
            userDetails: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    },
    results: {
        include: {
            student: {
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
            student: {
                username: 'asc',
            },
        },
    },
};

export const getExamSetup = async (currentUser, courseId = null) => {
    ensureExamModelsAvailable();
    const teacherId = currentUser.id;
    
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            id: true,
            type: true,
            collegeId: true,
        },
    });

    if (!teacher) {
        throw new NotFoundError('Teacher');
    }

    const courses = await prisma.course.findMany({
        where: currentUser.collegeId ? { collegeId: currentUser.collegeId } : undefined,
        select: {
            id: true,
            name: true,
            standard: true,
            semesters: true,
            collegeId: true,
            _count: {
                select: {
                    enrollments: true,
                },
            },
        },
        orderBy: [
            { standard: 'asc' },
            { name: 'asc' },
        ],
    });

    const mappedCourses = courses.map(course => {
        const semesters = parseSemesters(course.semesters);
        return {
            id: course.id,
            name: course.name,
            standard: course.standard,
            collegeId: course.collegeId,
            semesters: semesters,
            semesterCount: semesters.length,
            studentCount: course._count?.enrollments ?? 0,
        };
    });

    let eligibleStudents = [];
    let semesters = [];

    if (courseId) {
        const course = courses.find(c => c.id === Number(courseId));
        if (course) {
            semesters = parseSemesters(course.semesters);
            eligibleStudents = await getEnrolledStudents(courseId);
        }
    }

    return {
        courses: mappedCourses,
        semesters,
        eligibleStudents,
    };
};

export const createExamWithResult = async (teacherId, payload) => {
    ensureExamModelsAvailable();
    
    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            id: true,
            type: true,
            collegeId: true,
        },
    });

    if (!teacher) {
        throw new NotFoundError('Teacher');
    }

    const course = await prisma.course.findUnique({
        where: { id: Number(payload.courseId) },
        select: {
            id: true,
            name: true,
            standard: true,
            collegeId: true,
            semesters: true,
        },
    });

    if (!course) {
        throw new NotFoundError('Course');
    }

    if (teacher.type !== 'superadmin' && Number(course.collegeId ?? 0) !== Number(teacher.collegeId ?? 0)) {
        throw new ForbiddenError('You can only create exams for courses in your college');
    }


    const { semesterNumber, subjectCode } = payload;
    const subject = validateSemesterAndSubject(course, semesterNumber, subjectCode);

    const normalizedDate = normalizeDate(payload.examDate);
    const totalMarks = Number(subject.examTotalMarks);

    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
        throw new AppError('Invalid total marks for this subject', 400);
    }

    const enrolledStudents = await getEnrolledStudents(course.id);
    if (enrolledStudents.length === 0) {
        throw new AppError('No students enrolled in this course', 400);
    }

    const examData = {
        courseId: course.id,
        createdById: teacherId,
        semesterNumber,
        subjectName: subject.name,
        subjectCode,
        topic: String(payload.topic).trim(),
        examDate: normalizedDate,
        totalMarks,
    };

    const exam = await prisma.$transaction(async (tx) => {
        ensureExamModelsAvailable(tx);
        
        const newExam = await tx.exam.create({
            data: examData,
            include: examInclude,
        });

        if (payload.studentId && payload.marksObtained !== undefined) {
            const marksObtained = Number(payload.marksObtained);
            
            if (marksObtained > totalMarks) {
                throw new AppError('Marks obtained cannot exceed total marks', 400);
            }

            await tx.examResult.upsert({
                where: {
                    examId_studentId: {
                        examId: newExam.id,
                        studentId: payload.studentId,
                    },
                },
                create: {
                    examId: newExam.id,
                    studentId: payload.studentId,
                    marksObtained,
                    remark: payload.remark?.trim() || null,
                },
                update: {
                    marksObtained,
                    remark: payload.remark?.trim() || null,
                },
            });
        }

        return await tx.exam.findUnique({
            where: { id: newExam.id },
            include: examInclude,
        });
    });

    return exam;
};

export const updateExamWithResult = async (examId, currentUser, payload) => {
    ensureExamModelsAvailable();
    
    const existing = await prisma.exam.findUnique({
        where: { id: Number(examId) },
        select: {
            id: true,
            createdById: true,
            course: {
                select: {
                    collegeId: true,
                },
            },
        },
    });

    if (!existing) {
        throw new NotFoundError('Exam');
    }

    if (Number(existing.course?.collegeId ?? 0) !== Number(currentUser.collegeId ?? 0)) {
        throw new ForbiddenError('You can only update exams in your college');
    }

    const isAdmin = currentUser.type === 'admin';
    if (!isAdmin && existing.createdById !== currentUser.id) {
        throw new ForbiddenError('You can only update exams you created');
    }

    const course = await prisma.course.findUnique({
        where: { id: Number(payload.courseId) },
        select: {
            id: true,
            semesters: true,
        },
    });

    if (!course) {
        throw new NotFoundError('Course');
    }

    const { semesterNumber, subjectCode } = payload;
    const subject = validateSemesterAndSubject(course, semesterNumber, subjectCode);

    const normalizedDate = normalizeDate(payload.examDate);
    const totalMarks = Number(subject.examTotalMarks);

    const examData = {
        courseId: course.id,
        semesterNumber,
        subjectName: subject.name,
        subjectCode,
        topic: String(payload.topic).trim(),
        examDate: normalizedDate,
        totalMarks,
    };

    const exam = await prisma.$transaction(async (tx) => {
        ensureExamModelsAvailable(tx);
        
        await tx.exam.update({
            where: { id: Number(examId) },
            data: examData,
        });

        if (payload.studentId && payload.marksObtained !== undefined) {
            const marksObtained = Number(payload.marksObtained);
            
            if (marksObtained > totalMarks) {
                throw new AppError('Marks obtained cannot exceed total marks', 400);
            }

            await tx.examResult.upsert({
                where: {
                    examId_studentId: {
                        examId: Number(examId),
                        studentId: payload.studentId,
                    },
                },
                create: {
                    examId: Number(examId),
                    studentId: payload.studentId,
                    marksObtained,
                    remark: payload.remark?.trim() || null,
                },
                update: {
                    marksObtained,
                    remark: payload.remark?.trim() || null,
                },
            });
        }

        return await tx.exam.findUnique({
            where: { id: Number(examId) },
            include: examInclude,
        });
    });

    return exam;
};

export const getTeacherExams = async (currentUser) => {
    ensureExamModelsAvailable();
    
    const where = (currentUser.type === 'superadmin' && !currentUser.collegeId)
        ? {}

        : currentUser.type === 'teacher'
            ? {
                createdById: currentUser.id,
                course: {
                    collegeId: currentUser.collegeId,
                },
            }
            : currentUser.collegeId
                ? {
                    course: {
                        collegeId: currentUser.collegeId,
                    },
                }
                : {};

    return await prisma.exam.findMany({
        where,
        include: examInclude,
        orderBy: [
            { examDate: 'desc' },
            { createdAt: 'desc' },
        ],
    });
};

export const getExamById = async (examId, currentUser) => {
    ensureExamModelsAvailable();
    
    const exam = await prisma.exam.findUnique({
        where: { id: Number(examId) },
        include: examInclude,
    });

    if (!exam) {
        throw new NotFoundError('Exam');
    }

    const isGlobalSuperadmin = currentUser.type === 'superadmin' && !currentUser.collegeId;
    if (!isGlobalSuperadmin && Number(exam.course?.collegeId ?? 0) !== Number(currentUser.collegeId ?? 0)) {

        throw new ForbiddenError('You are not allowed to view this exam');
    }

    if (currentUser.type !== 'superadmin' && currentUser.type !== 'admin' && currentUser.type !== 'manager' && exam.createdById !== currentUser.id) {
        throw new ForbiddenError('You are not allowed to view this exam');
    }

    return exam;
};

export const getStudentExamResults = async (studentId, semesterFilter = null) => {
    ensureExamModelsAvailable();
    
    const where = {
        studentId,
    };

    const results = await prisma.examResult.findMany({
        where,
        include: {
            exam: {
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                            standard: true,
                        },
                    },
                    createdBy: {
                        select: {
                            username: true,
                            userDetails: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: [
            {
                exam: {
                    examDate: 'desc',
                },
            },
            {
                createdAt: 'desc',
            },
        ],
    });

    if (semesterFilter !== null) {
        return results.filter(r => r.exam.semesterNumber === Number(semesterFilter));
    }

    return results;
};

export const getAllExamResults = async (currentUser, filters = {}) => {
    ensureExamModelsAvailable();
    
    const where = (currentUser.type === 'superadmin' && !currentUser.collegeId)
        ? {} 

        : {
            exam: {
                course: {
                    collegeId: currentUser.collegeId,
                },
            },
        };

    if (filters.semesterNumber) {
        where.exam.semesterNumber = Number(filters.semesterNumber);
    }

    if (filters.subjectCode) {
        where.exam.subjectCode = filters.subjectCode;
    }

    return await prisma.examResult.findMany({
        where,
        include: {
            exam: {
                include: {
                    course: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            student: {
                select: {
                    id: true,
                    username: true,
                    userDetails: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const createExamResult = async (examId, teacherId, payload) => {
    ensureExamModelsAvailable();
    
    const exam = await prisma.exam.findUnique({
        where: { id: Number(examId) },
        include: {
            course: true,
        },
    });

    if (!exam) {
        throw new NotFoundError('Exam');
    }

    const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: {
            id: true,
            type: true,
            collegeId: true,
        },
    });

    if (!teacher) {
        throw new NotFoundError('Teacher');
    }

    const isGlobalSuperadmin = teacher.type === 'superadmin' && !teacher.collegeId;
    if (!isGlobalSuperadmin && Number(exam.course?.collegeId ?? 0) !== Number(teacher.collegeId ?? 0)) {

        throw new ForbiddenError('You can only enter results for exams in your college');
    }


    const isTeacher = teacher.type === 'teacher';
    if (!isTeacher && teacher.type !== 'admin' && teacher.type !== 'manager' && teacher.type !== 'superadmin') {
        throw new ForbiddenError('You are not authorized to enter exam results');
    }


    if (isTeacher && exam.createdById !== teacher.id) {
        throw new ForbiddenError('You can only enter results for exams you created');
    }

    const marksObtained = Number(payload.marksObtained);
    if (marksObtained > Number(exam.totalMarks)) {
        throw new AppError('Marks obtained cannot exceed total marks', 400);
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: payload.studentId,
                courseId: exam.courseId,
            },
        },
    });

    if (!enrollment) {
        throw new AppError('Student is not enrolled in this course', 400);
    }

    const result = await prisma.examResult.upsert({
        where: {
            examId_studentId: {
                examId: Number(examId),
                studentId: payload.studentId,
            },
        },
        create: {
            examId: Number(examId),
            studentId: payload.studentId,
            marksObtained,
            remark: payload.remark?.trim() || null,
        },
        update: {
            marksObtained,
            remark: payload.remark?.trim() || null,
        },
    });

    return result;
};
