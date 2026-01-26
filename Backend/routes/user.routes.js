import express from 'express';
import { editUser, removeUser, dailyClaim } from '../controllers/user_actions.controller.js';
import { getStudents, getTeachers, getUserProfileByName, addTeacher } from '../controllers/user_management.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/update/:id', verifyToken, editUser);
router.delete('/delete/:id', verifyToken, removeUser);
router.post('/claim-daily', verifyToken, dailyClaim);

router.post('/claim-daily', verifyToken, dailyClaim);

// Management Routes
router.get('/students', verifyToken, getStudents);
router.get('/teachers', verifyToken, getTeachers);
router.get('/search', verifyToken, getUserProfileByName);
router.post('/teacher/add', verifyToken, addTeacher); // Ideally restrict to admin

export default router;
