const express = require('express');
const router = express.Router();

const attendanceController = require('../controllers/attendance.controller');

// Define your attendance routes here
router.post('/', attendanceController.createAttendance);
router.get('/student/:studentId', attendanceController.getAttendanceByStudent);
router.get('/subject/:subjectId', attendanceController.getAttendanceBySubject);

module.exports = router;