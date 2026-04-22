import express from 'express';
import { createManualTransaction, getMyTransactions, getRecordedTransactions, getTransaction, getUserTransactionsList, getDues, payFee } from './transaction.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/me', verifyToken, getMyTransactions);
router.get('/dues', verifyToken, getDues);
router.post('/pay-fee', verifyToken, payFee);
router.get('/recorded', verifyToken, authorize('admin', 'manager'), getRecordedTransactions);
router.post('/manual', verifyToken, authorize('admin', 'manager'), createManualTransaction);
router.get('/user/:userId', verifyToken, authorize('admin'), getUserTransactionsList);
router.get('/user/:userId/dues', verifyToken, authorize('admin', 'manager'), getDues);
router.get('/:id', verifyToken, getTransaction);

export default router;
