import { createOrder, verifyPayment, recordFeePayment, recordPaymentFailure } from './razorpay.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { z } from 'zod';

// Schema for creating a Razorpay order
const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.object({
    studentId: z.string(),
    studentName: z.string().optional(),
    feeDescription: z.string().optional(),
    dueDate: z.string().optional(),
  }).optional(),
});

// Schema for verifying Razorpay payment
const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  feeDetails: z.object({
    studentId: z.string(),
    amount: z.number().positive(),
    description: z.string().optional(),
  }),
});

/**
 * POST /api/razorpay/create-order
 * Create a Razorpay order for fee payment
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    
    // Generate a receipt ID
    const receipt = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Prepare notes for Razorpay
    const notes = {
      ...(validatedData.notes || {}),
      userId: req.user.id,
      collegeId: req.user.collegeId,
    };
    
    // Create the Razorpay order
    const order = await createOrder({
      amount: validatedData.amount,
      currency: validatedData.currency,
      receipt,
      notes,
    });
    
    return sendSuccess(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    }, 'Razorpay order created successfully');
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors);
    }
    
    console.error('Error creating Razorpay order:', error);
    return sendError(res, 'Failed to create Razorpay order', 500);
  }
};

/**
 * POST /api/razorpay/verify-payment
 * Verify Razorpay payment and record transaction
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const validatedData = verifyPaymentSchema.parse(req.body);
    
    // Verify the payment signature
    const isValidSignature = verifyPayment({
      razorpayOrderId: validatedData.razorpayOrderId,
      razorpayPaymentId: validatedData.razorpayPaymentId,
      razorpaySignature: validatedData.razorpaySignature,
    });
    
    if (!isValidSignature) {
      return sendError(res, 'Invalid payment signature', 400);
    }
    
    // Record the fee payment as a transaction
    const transaction = await recordFeePayment(
      req.user,
      {
        razorpayOrderId: validatedData.razorpayOrderId,
        razorpayPaymentId: validatedData.razorpayPaymentId,
        razorpaySignature: validatedData.razorpaySignature,
      },
      {
        studentId: validatedData.feeDetails.studentId,
        amount: validatedData.feeDetails.amount,
        description: validatedData.feeDetails.description,
      }
    );
    
    return sendSuccess(res, transaction, 'Payment verified and recorded successfully');
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors);
    }
    
    console.error('Error verifying Razorpay payment:', error);
    console.error('Stack:', error.stack);
    return sendError(res, 'Failed to verify payment: ' + error.message, 500);
  }
};

/**
 * POST /api/razorpay/webhook
 * Handle Razorpay webhook notifications
 */
export const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature (optional but recommended)
    // const webhookSignature = req.headers['x-razorpay-signature'];
    // const isValidWebhook = verifyWebhookSignature(req.body, webhookSignature);
    
    // if (!isValidWebhook) {
    //   return sendError(res, 'Invalid webhook signature', 400);
    // }
    
    const payload = req.body;
    
    // Handle different webhook events
    switch (payload.event) {
      case 'payment.captured':
        // Payment was successfully captured
        // You might want to update any pending orders or send notifications here
        console.log('Payment captured:', payload.payload.payment.entity.id);
        break;
        
      case 'payment.failed':
        // Payment failed
        // You might want to notify the user or mark the order as failed
        console.log('Payment failed:', payload.payload.payment.entity.id);
        break;
        
      default:
        console.log('Unhandled webhook event:', payload.event);
    }
    
    // Always return 200 to Razorpay webhook
    return sendSuccess(res, {}, 'Webhook received');
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    return sendError(res, 'Webhook processing failed', 500);
  }
};

/**
 * POST /api/razorpay/record-failure
 * Record a failed payment attempt
 */
export const logPaymentFailure = async (req, res) => {
  try {
    const { amount, studentId, errorDescription, errorCode, paymentId } = req.body;
    
    if (!amount) {
      return sendError(res, 'Amount is required', 400);
    }
    
    const transaction = await recordPaymentFailure(req.user, {
      amount,
      studentId: studentId || req.user.id,
      errorDescription,
      errorCode,
      paymentId
    });
    
    return sendSuccess(res, transaction, 'Failure recorded successfully');
  } catch (error) {
    console.error('Error recording payment failure:', error);
    return sendError(res, 'Failed to record failure', 500);
  }
};