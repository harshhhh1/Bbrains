import express from 'express';
import { 
    getNotifications, 
    markAsRead, 
    markAllRead,
    markChannelRead,
    getUnreadNotificationCount,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
} from './notification.controller.js';
import verifyToken from '../../middleware/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadNotificationCount);
router.post('/subscribe', verifyToken, subscribeToPushNotifications);
router.delete('/unsubscribe', verifyToken, unsubscribeFromPushNotifications);
router.post('/mark-read/:id', verifyToken, markAsRead);
router.post('/mark-read', verifyToken, markChannelRead);
router.post('/mark-all-read', verifyToken, markAllRead);

export default router;
