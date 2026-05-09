import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleWebhook,
  logPaymentFailure,
} from './razorpay.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import authorize from '../../middleware/authorize.js';

const router = express.Router();

// Create Razorpay order for fee payment
router.post('/create-order', verifyToken, createRazorpayOrder);

// Verify Razorpay payment and record transaction
router.post('/verify-payment', verifyToken, verifyRazorpayPayment);

// Record failed payment attempt
router.post('/record-failure', verifyToken, logPaymentFailure);

// Handle Razorpay webhook notifications (no auth required as Razorpay calls this directly)
router.post('/webhook', handleWebhook);

export default router;
