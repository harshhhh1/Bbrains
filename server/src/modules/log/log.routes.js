import express from 'express';
import { getMyLogs, getAllLogs, getLogById, getLogStats } from './log.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/me', verifyToken, getMyLogs);
router.get('/stats', verifyToken, authorize('admin', 'superadmin'), getLogStats);
router.get('/:id', verifyToken, authorize('admin', 'superadmin'), getLogById);
router.get('/', verifyToken, authorize('admin', 'superadmin'), getAllLogs);

export default router;
