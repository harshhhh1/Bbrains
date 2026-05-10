import { z } from 'zod';

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

export {
    createOrderSchema,
    verifyPaymentSchema
};