import express from 'express';
const router = express.Router();

import * as attendanceController from '../controllers/attendance.controller.js';

// Define your attendance routes here
router.post('/', attendanceController.createAttendance);
router.get('/student/:studentId', attendanceController.getAttendanceByStudent);
router.get('/subject/:subjectId', attendanceController.getAttendanceBySubject);

export default router;