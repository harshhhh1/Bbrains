import express from 'express'
const router = express.Router();

import * as subjectController from '../controllers/subject.controller.js';

// Define your subject routes here
router.get('/', subjectController.getSubjects);
router.post('/', subjectController.createSubject);

export default router;