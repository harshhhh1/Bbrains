import express from 'express';
import { createManualTransaction, getMyTransactions, getRecordedTransactions, getTransaction, getUserTransactionsList, getDues, payFee } from './transaction.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.get('/me', verifyToken, getMyTransactions);
router.get('/dues', verifyToken, getDues);
router.post('/pay-fee', verifyToken, payFee);
router.get('/recorded', verifyToken, checkPermission('manage_finance'), getRecordedTransactions);
router.post('/manual', verifyToken, checkPermission('manage_finance'), createManualTransaction);
router.get('/user/:userId', verifyToken, checkPermission('manage_finance'), getUserTransactionsList);
router.get('/user/:userId/dues', verifyToken, checkPermission('manage_finance'), getDues);
router.get('/:id', verifyToken, getTransaction);

export default router;
