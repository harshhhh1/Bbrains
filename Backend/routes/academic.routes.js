import express from 'express';
import {
    createAssignmentHandler,
    getAssignmentsHandler,
    submitAssignmentHandler,
    getSubmissionsHandler,
    createAnnouncementHandler,
    getAnnouncementsHandler,
    deleteAnnouncementHandler
} from '../controllers/academic.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

// Assignments
router.post('/assignments', verifyToken, createAssignmentHandler);
router.get('/assignments/:courseId', verifyToken, getAssignmentsHandler);
router.post('/assignments/:id/submit', verifyToken, submitAssignmentHandler);
router.get('/assignments/:id/submissions', verifyToken, getSubmissionsHandler);

// Announcements
router.post('/announcements', verifyToken, createAnnouncementHandler);
router.get('/announcements', verifyToken, getAnnouncementsHandler);
router.delete('/announcements/:id', verifyToken, deleteAnnouncementHandler);

export default router;
