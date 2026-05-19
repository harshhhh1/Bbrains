import express from 'express';
import { getUpcoming, createEvent, getEvents } from './event.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.get('/upcoming', verifyToken, getUpcoming);
router.get('/', verifyToken, getEvents);
router.post('/', verifyToken, checkPermission('create_event'), createEvent);

export default router;
