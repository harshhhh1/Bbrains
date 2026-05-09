import express from 'express';
import {
  getStudentFeeSummaryHandler,
  getAllFeeTransactionsHandler,
} from './fee.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Get fee summary for current student
router.get('/summary', verifyToken, getStudentFeeSummaryHandler);

// Get fee summary for specific student (admin/manager only)
router.get('/summary/:userId', verifyToken, authorize('admin', 'manager'), getStudentFeeSummaryHandler);

// Get all fee transactions (admin/manager only)
router.get('/all-transactions', verifyToken, authorize('admin', 'manager'), getAllFeeTransactionsHandler);

export default router;
