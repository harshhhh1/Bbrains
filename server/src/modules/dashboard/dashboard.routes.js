import express from 'express';
import { getAdminOverview, getDashboard, getManagerOverview, claimDaily } from './dashboard.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/', verifyToken, getDashboard);
router.get('/admin-overview', verifyToken, authorize('admin', 'superadmin'), getAdminOverview);
router.get('/manager-overview', verifyToken, getManagerOverview);
router.post('/claim-daily', verifyToken, claimDaily);

export default router;
