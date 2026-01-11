import express from 'express';
const router = express.Router();

import * as collegeController from '../controllers/college.controller.js';

// Define your college routes here
router.get('/', collegeController.getColleges);
router.post('/', collegeController.createCollege);
router.get('/:collegeId/courses', collegeController.getCollegeCourses);

export default router;