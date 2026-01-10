const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedback.controller');

// Define your feedback routes here
router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getFeedback);

module.exports = router;