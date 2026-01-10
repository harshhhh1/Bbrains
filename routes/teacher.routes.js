const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacher.controller');

// Define your teacher routes here
router.get('/', teacherController.getTeachers);
router.get('/:teacherId', teacherController.getTeacherById);

module.exports = router;