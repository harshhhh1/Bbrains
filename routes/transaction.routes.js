const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transaction.controller');

// Define your transaction routes here
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:transactionId', transactionController.getTransactionById);

module.exports = router;