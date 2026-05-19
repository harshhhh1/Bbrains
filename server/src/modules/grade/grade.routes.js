import express from 'express';
import { gradeSubmission, getMyGrades, getStudentGrades, updateGrade, getAssignmentGrades } from './grade.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.post('/', verifyToken, checkPermission('edit_grades'), gradeSubmission);
router.get('/me', verifyToken, getMyGrades);
router.get('/student/:userId', verifyToken, checkPermission('view_grades'), getStudentGrades);
router.put('/:id', verifyToken, checkPermission('edit_grades'), updateGrade);
router.get('/assignment/:assignmentId', verifyToken, checkPermission('view_grades'), getAssignmentGrades);

export default router;
