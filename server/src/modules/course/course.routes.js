import express from 'express';
import {
    createCourse, getCourses, getCourse, updateCourse,
    deleteCourse, listCourseStudents, listCourseAssignments
} from './course.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.post('/', verifyToken, checkPermission('manage_course'), createCourse);
router.get('/', verifyToken, getCourses);
router.get('/:id', verifyToken, getCourse);
router.put('/:id', verifyToken, checkPermission('manage_course'), updateCourse);
router.delete('/:id', verifyToken, checkPermission('manage_course'), deleteCourse);
router.get('/:id/students', verifyToken, listCourseStudents);
router.get('/:id/assignments', verifyToken, listCourseAssignments);

export default router;
