import express from 'express';
const router = express.Router();

import * as feedbackController from '../controllers/feedback.controller.js';

// Define your feedback routes here
router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getFeedback);

export default router;