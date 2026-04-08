import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createAuditLog } from '../../utils/auditLog.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import prisma from '../../utils/prisma.js';
import { createManualTransactionRecord } from '../transaction/transaction.service.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order for fee payment
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} Razorpay order details
 */
export const createOrder = async ({ amount, currency = 'INR', receipt, notes }) => {
  const options = {
    amount: amount * 100, // Amount in paise (INR)
    currency,
    receipt,
    notes,
  };

  return await razorpay.orders.create(options);
};

/**
 * Verify Razorpay payment signature
 * @param {Object} params - Payment verification parameters
 * @returns {boolean} True if signature is valid
 */
export const verifyPayment = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  
  hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const generatedSignature = hmac.digest('hex');
  
  return generatedSignature === razorpaySignature;
};

/**
 * Record a successful Razorpay fee payment as a transaction
 * @param {Object} user - User making the payment
 * @param {Object} paymentData - Payment details from Razorpay
 * @param {Object} feeDetails - Fee information (amount, student info, etc.)
 * @returns {Promise<Object>} Created transaction record
 */
export const recordFeePayment = async (user, paymentData, feeDetails) => {
  return await prisma.$transaction(async (tx) => {
    // Create manual transaction record for the fee payment
    const transactionPayload = {
      category: 'fee',
      targetUserId: feeDetails.studentId,
      amount: feeDetails.amount,
      paymentMode: 'card', // Razorpay payments are typically card/online payments
      referenceId: paymentData.razorpay_payment_id,
      note: `Razorpay payment for ${feeDetails.description || 'college fees'} - Order ID: ${paymentData.razorpay_order_id}`,
      paymentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };

    // Create the transaction record
    const transaction = await createManualTransactionRecord(user, transactionPayload);

    // Log audit trail
    await createAuditLog(
      user.id,
      'FINANCE',
      'CREATE',
      'TransactionHistory',
      String(transaction?.id || ''),
      {
        after: {
          category: 'fee',
          targetUserId: feeDetails.studentId,
          amount: feeDetails.amount,
          paymentMode: 'card',
          referenceId: paymentData.razorpay_payment_id,
          note: transactionPayload.note,
        },
      },
      `Recorded Razorpay fee payment transaction`
    );

    return transaction;
  });
};