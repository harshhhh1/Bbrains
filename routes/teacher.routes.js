import express from 'express'
const router = express.Router();

import * as teacherController from '../controllers/teacher.controller.js';

// Define your teacher routes here
router.get('/', teacherController.getTeachers);
router.get('/:teacherId', teacherController.getTeacherById);

export default router;