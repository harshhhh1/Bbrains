import express from 'express';
import {
    createAssignmentHandler, getAssignmentsHandler, getMySubmissionsHandler, getAssignmentHandler,
    updateAssignmentHandler, deleteAssignmentHandler,
    submitAssignmentHandler, getSubmissionsHandler, reviewSubmissionHandler,
    createAnnouncementHandler, getAnnouncementsHandler, deleteAnnouncementHandler
} from './academic.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Submissions
router.get('/assignments/submissions/my', verifyToken, getMySubmissionsHandler);
router.post('/assignments/submit', verifyToken, submitAssignmentHandler);
router.get('/assignments/:assignmentId/submissions', verifyToken, authorize('teacher', 'admin', 'manager'), getSubmissionsHandler);
router.post('/assignments/submissions/:submissionId/review', verifyToken, authorize('teacher', 'admin', 'manager'), reviewSubmissionHandler);

// Assignments
router.post('/assignments', verifyToken, authorize('teacher', 'admin', 'manager'), createAssignmentHandler);
router.get('/assignments', verifyToken, getAssignmentsHandler);
router.get('/assignments/:id', verifyToken, getAssignmentHandler);
router.put('/assignments/:id', verifyToken, authorize('teacher', 'admin', 'manager'), updateAssignmentHandler);
router.delete('/assignments/:id', verifyToken, authorize('teacher', 'admin', 'manager'), deleteAssignmentHandler);

// Announcements
router.post('/announcements', verifyToken, authorize('teacher', 'admin'), createAnnouncementHandler);
router.get('/announcements', verifyToken, getAnnouncementsHandler);
router.delete('/announcements/:id', verifyToken, authorize('teacher', 'admin'), deleteAnnouncementHandler);

export default router;
