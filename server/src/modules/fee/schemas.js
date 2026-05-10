import { z } from 'zod';

const feeSummarySchema = z.object({
  // No specific params needed, we'll get student ID from auth
});

const getAllFeeTransactionsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export {
  feeSummarySchema,
  getAllFeeTransactionsSchema
};