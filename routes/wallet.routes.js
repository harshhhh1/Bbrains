const express = require('express');
const router = express.Router();

const walletController = require('../controllers/wallet.controller');

// Define your wallet routes here
router.get('/', walletController.getWallet);
router.post('/create', walletController.createWallet);
router.post('/set-pin', walletController.setWalletPin);
router.post('/lock', walletController.lockWallet);

module.exports = router;