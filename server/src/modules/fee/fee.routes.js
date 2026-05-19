import express from 'express';
import {
  getStudentFeeSummaryHandler,
  getAllFeeTransactionsHandler,
} from './fee.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

// Get fee summary for current student
router.get('/summary', verifyToken, getStudentFeeSummaryHandler);

// Get fee summary for specific student (users with manage_finance permission)
router.get('/summary/:userId', verifyToken, checkPermission('manage_finance'), getStudentFeeSummaryHandler);

// Get all fee transactions (users with manage_finance permission)
router.get('/all-transactions', verifyToken, checkPermission('manage_finance'), getAllFeeTransactionsHandler);

export default router;
