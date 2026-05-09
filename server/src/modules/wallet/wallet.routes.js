import express from 'express';
import {
    getWalletHandler, getBalance, setupPin, changePin,
    verifyPin, transferHandler, getHistoryHandler,
    getRequests, getIncomingRequests,
    handleCreateRequest, handleRespondToRequest
} from './wallet.controller.js';
import { 
    getMyTransactions, getRecordedTransactions, createManualTransaction, getUserTransactionsList 
} from '../transaction/transaction.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

router.get('/', verifyToken, getWalletHandler);
router.get('/balance', verifyToken, getBalance);
router.get('/history', verifyToken, getHistoryHandler);
router.get('/transactions', verifyToken, getMyTransactions);
router.get('/recorded-transactions', verifyToken, authorize('admin', 'manager'), getRecordedTransactions);
router.post('/manual-transaction', verifyToken, authorize('admin', 'manager'), createManualTransaction);
router.get('/transactions/user/:userId', verifyToken, authorize('admin'), getUserTransactionsList);

router.post('/setup', verifyToken, setupPin);
router.post('/setup-pin', verifyToken, setupPin);
router.put('/pin', verifyToken, changePin);
router.post('/change-pin', verifyToken, changePin);
router.post('/verify-pin', verifyToken, verifyPin);
router.post('/transfer', verifyToken, transferHandler);

router.get('/requests', verifyToken, getRequests);
router.get('/requests/incoming', verifyToken, getIncomingRequests);
router.post('/requests', verifyToken, handleCreateRequest);
router.post('/requests/:id/respond', verifyToken, handleRespondToRequest);

export default router;
