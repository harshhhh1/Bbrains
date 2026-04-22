import express from 'express';
import {
    getMe, getUserByUsername, getStudents, getTeachers, getStaff,
    getStudentByUsername, getTeacherByUsername,
    addTeacher, addStudent, addManager, addAdmin, getManagers, getAdmins, updateTeacher, updateStudent, deleteTeacher, searchUser,
    checkUsernameAvailability, batchImportUsers, fixMissingRoles
} from './user_management.controller.js';
import { editUser, removeUser, dailyClaim } from './user_actions.controller.js';
import { createDetails, getMyDetails, updateMyDetails, getUserDetails } from './userDetails.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Profile
router.get('/me', verifyToken, getMe);
router.get('/search', verifyToken, searchUser);
router.get('/check-username/:username', verifyToken, checkUsernameAvailability);

// User Details
router.post('/me/details', verifyToken, createDetails);
router.get('/me/details', verifyToken, getMyDetails);
router.put('/me/details', verifyToken, updateMyDetails);
router.get('/:id/details', verifyToken, authorize('teacher', 'admin', 'manager', 'superadmin'), getUserDetails);

// Student endpoints
router.get('/students', verifyToken, authorize('teacher', 'admin', 'staff', 'manager', 'superadmin'), getStudents);
router.get('/students/:username', verifyToken, authorize('teacher', 'admin', 'staff', 'manager', 'superadmin'), getStudentByUsername);
router.get('/staff', verifyToken, authorize('admin', 'manager', 'superadmin'), getStaff);
router.post('/students', verifyToken, authorize('admin', 'manager', 'superadmin'), addStudent);
router.put('/students/:id', verifyToken, authorize('admin', 'manager', 'superadmin'), updateStudent);

// Teacher endpoints
router.get('/teachers', verifyToken, getTeachers);
router.get('/teachers/:username', verifyToken, getTeacherByUsername);
router.post('/teachers', verifyToken, authorize('admin', 'manager', 'superadmin'), addTeacher);
router.put('/teachers/:id', verifyToken, authorize('admin', 'manager', 'superadmin'), updateTeacher);
router.delete('/teachers/:id', verifyToken, authorize('admin', 'manager', 'superadmin'), deleteTeacher);

// Manager endpoints
router.get('/managers', verifyToken, authorize('admin', 'superadmin'), getManagers);
router.post('/managers', verifyToken, authorize('admin', 'superadmin'), addManager);

// Admin endpoints
router.get('/admins', verifyToken, authorize('superadmin'), getAdmins);
router.post('/admins', verifyToken, authorize('superadmin'), addAdmin);

// User actions
router.put('/update/:id', verifyToken, editUser);
router.delete('/delete/:id', verifyToken, authorize('admin', 'manager', 'superadmin'), removeUser);
router.post('/claim-daily', verifyToken, dailyClaim);

// Batch import users from CSV
router.post('/batch-import', verifyToken, authorize('admin', 'manager', 'superadmin'), upload.single('file'), batchImportUsers);
router.post('/fix-roles', verifyToken, authorize('admin', 'manager', 'superadmin', 'superadmin'), fixMissingRoles);

// Get user by username (must be LAST due to :username param matching)
router.get('/:username', verifyToken, getUserByUsername);

export default router;
