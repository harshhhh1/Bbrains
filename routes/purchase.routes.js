import express from 'express'
const router = express.Router();

import * as purchaseController from '../controllers/purchase.controller.js';

// Define your purchase routes here
router.post('/', purchaseController.createPurchase);
router.get('/history', purchaseController.getPurchaseHistory);

export default router;