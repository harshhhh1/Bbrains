const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');

// Define your admin routes here
router.post('/import/users', adminController.importUsers);
router.post('/import/students', adminController.importStudents);
router.post('/import/teachers', adminController.importTeachers);

module.exports = router;