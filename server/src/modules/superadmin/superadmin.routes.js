import express from 'express';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';
import * as controller from './superadmin.controller.js';

const router = express.Router();

// Apply middleware to restrict all routes to superadmin
router.use(verifyToken, authorize('superadmin'));

router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/dashboard/top-colleges', controller.getTopColleges);
router.get('/dashboard/recent-logs', controller.getRecentAuditLogs);
router.get('/dashboard/pending-actions', controller.getPendingActions);

router.get('/colleges', controller.listColleges);
router.get('/colleges/:id/features', controller.getCollegeFeatures);
router.put('/colleges/:id/features', controller.updateCollegeFeatures);

router.get('/features/global', controller.getGlobalFeatures);
router.put('/features/global', controller.updateGlobalFeatures);

export default router;
