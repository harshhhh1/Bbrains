const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchase.controller');

// Define your purchase routes here
router.post('/', purchaseController.createPurchase);
router.get('/history', purchaseController.getPurchaseHistory);

module.exports = router;