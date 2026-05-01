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
} from './exam.controller.js';

const router = express.Router();

router.get('/setup', verifyToken, authorize('teacher', 'admin'), getExamSetupHandler);
router.get('/results/me', verifyToken, getMyExamResultsHandler);
router.get('/my', verifyToken, getMyExamResultsHandler);
router.get('/results/all', verifyToken, authorize('teacher', 'admin', 'manager'), getAllExamResultsHandler);
router.get('/teacher', verifyToken, authorize('teacher', 'admin', 'manager'), listTeacherExamsHandler);
router.get('/', verifyToken, authorize('teacher', 'admin', 'manager'), listTeacherExamsHandler);
router.get('/:id', verifyToken, authorize('teacher', 'admin', 'manager'), getExamHandler);
router.post('/', verifyToken, authorize('teacher', 'admin'), createExamHandler);
router.put('/:id', verifyToken, authorize('teacher', 'admin'), updateExamHandler);
router.post('/:examId/results', verifyToken, authorize('teacher', 'admin', 'manager'), createExamResultHandler);

export default router;

export const courseSemestersRouter = express.Router();
courseSemestersRouter.get('/:courseId/semesters', verifyToken, getCourseSemestersHandler);