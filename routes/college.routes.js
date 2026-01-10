const express = require('express');
const router = express.Router();

const collegeController = require('../controllers/college.controller');

// Define your college routes here
router.get('/', collegeController.getColleges);
router.post('/', collegeController.createCollege);
router.get('/:collegeId/courses', collegeController.getCollegeCourses);

module.exports = router;