import express from 'express';
import { getMyLogs, getAllLogs, getLogById, getLogStats } from './log.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.get('/me', verifyToken, getMyLogs);
router.get('/stats', verifyToken, checkPermission('view_audit_logs'), getLogStats);
router.get('/:id', verifyToken, checkPermission('view_audit_logs'), getLogById);
router.get('/', verifyToken, checkPermission('view_audit_logs'), getAllLogs);

export default router;
