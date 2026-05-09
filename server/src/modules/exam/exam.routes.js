import express from 'express';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';
import {
    createExamHandler,
    createExamResultHandler,
    getAllExamResultsHandler,
    getCourseSemestersHandler,
    getExamHandler,
    getExamSetupHandler,
    getMyExamResultsHandler,
    listTeacherExamsHandler,
    updateExamHandler,
    listCourseStudentsHandler,
    saveStudentExamResultsHandler,
    getUpcomingExamsHandler,
} from './exam.controller.js';

const router = express.Router();

router.get('/setup', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), getExamSetupHandler);
router.get('/upcoming', verifyToken, getUpcomingExamsHandler);
router.get('/results/me', verifyToken, getMyExamResultsHandler);
router.get('/my', verifyToken, getMyExamResultsHandler);
router.get('/results/all', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), getAllExamResultsHandler);
router.get('/teacher', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), listTeacherExamsHandler);
router.get('/', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), listTeacherExamsHandler);
router.get('/course-students/:courseId', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), listCourseStudentsHandler);
router.get('/:id', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), getExamHandler);
router.post('/', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), createExamHandler);
router.put('/:id', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), updateExamHandler);
router.post('/:examId/results', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), createExamResultHandler);
router.post('/:examId/results/bulk', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), saveStudentExamResultsHandler);

export default router;

export const courseSemestersRouter = express.Router();
courseSemestersRouter.get('/:courseId/semesters', verifyToken, getCourseSemestersHandler);
