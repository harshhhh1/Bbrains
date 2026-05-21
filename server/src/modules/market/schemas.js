import { z } from 'zod';

const approvalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional()
});

const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().optional(),
  productType: z.enum(['digital', 'physical']).default('physical'),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
  category: z.string().max(50).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1)
});

const buyNowSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  pin: z.string().length(6)
});

const createProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  stock: z.number().optional(),
  imageUrl: z.string().optional(),
  productType: z.enum(['digital', 'physical']).default('physical'),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  category: z.string().optional(),
  metadata: z.any().optional()
});

export {
  approvalSchema,
  productSchema,
  cartItemSchema,
  buyNowSchema,
  createProductSchema
};