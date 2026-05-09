import express from 'express';
import { 
    getNotifications, 
    markAsRead, 
    markAllRead,
    markChannelRead,
    getUnreadNotificationCount,
} from './notification.controller.js';
import verifyToken from '../../middleware/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadNotificationCount);
router.post('/:id/read', verifyToken, markAsRead);
router.post('/channel/:channelId/read', verifyToken, markChannelRead);
router.post('/mark-read', verifyToken, markChannelRead);
router.post('/mark-all-read', verifyToken, markAllRead);

export default router;
