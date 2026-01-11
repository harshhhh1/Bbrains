import express from 'express';
const router = express.Router();

import * as courseController from '../controllers/course.controller.js';

// Define your course routes here
router.get('/', courseController.getCourses);
router.post('/', courseController.createCourse);
router.get('/:courseId/subjects', courseController.getCourseSubjects);

export default router;