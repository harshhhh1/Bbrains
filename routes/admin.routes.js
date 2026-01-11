import express from 'express';
const router = express.Router();

import * as adminController from '../controllers/admin.controller.js';

// Define your admin routes here
router.post('/import/users', adminController.importUsers);
router.post('/import/students', adminController.importStudents);
router.post('/import/teachers', adminController.importTeachers);

export default router;