const express = require('express');
const router = express.Router();

const courseController = require('../controllers/course.controller');

// Define your course routes here
router.get('/', courseController.getCourses);
router.post('/', courseController.createCourse);
router.get('/:courseId/subjects', courseController.getCourseSubjects);

module.exports = router;