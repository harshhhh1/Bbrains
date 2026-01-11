import express from 'express'
const router = express.Router();

import * as studentController from '../controllers/student.controller.js';

// Define your student routes here
router.get('/', studentController.getStudents);
router.get('/:studentId', studentController.getStudentById);
router.put('/:studentId', studentController.updateStudent);
router.post('/:studentId/badges', studentController.addStudentBadge);

export default router;