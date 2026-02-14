import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
const router = express.Router();

// router.get('/dashboard', getuserdata)
router.get('/dashboard', getDashboardData);

export default router;