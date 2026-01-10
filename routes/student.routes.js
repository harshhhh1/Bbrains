const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student.controller');

// Define your student routes here
router.get('/', studentController.getStudents);
router.get('/:studentId', studentController.getStudentById);
router.put('/:studentId', studentController.updateStudent);
router.post('/:studentId/badges', studentController.addStudentBadge);

module.exports = router;