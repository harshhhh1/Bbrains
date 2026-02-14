import express from 'express';
import { transferHandler, getHistoryHandler, getWalletHandler } from '../controllers/wallet.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getWalletHandler);
router.post('/transfer', verifyToken, transferHandler);
router.get('/history', verifyToken, getHistoryHandler);

export default router;
