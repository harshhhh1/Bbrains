import express from 'express'
const router = express.Router();

import * as walletController from '../controllers/wallet.controller.js';

// Define your wallet routes here
router.get('/', walletController.getWallet);
router.post('/create', walletController.createWallet);
router.post('/set-pin', walletController.setWalletPin);
router.post('/lock', walletController.lockWallet);

export default router;