const express = require('express');
const router = express.Router();

const subjectController = require('../controllers/subject.controller');

// Define your subject routes here
router.get('/', subjectController.getSubjects);
router.post('/', subjectController.createSubject);

module.exports = router;