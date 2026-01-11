import express from 'express'
const router = express.Router();

import * as transactionController from '../controllers/transaction.controller.js';

// Define your transaction routes here
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:transactionId', transactionController.getTransactionById);

export default router;