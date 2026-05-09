import { getStudentFeeSummary, getAllFeeTransactions } from './fee.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { z } from 'zod';

// Schema for fee summary request (no params needed for now)
const feeSummarySchema = z.object({
  // No specific params needed, we'll get student ID from auth
});

// Schema for getting all fee transactions (admin/manager only)
const getAllFeeTransactionsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * GET /api/fee/summary
 * Get fee summary for the current student
 */
export const getStudentFeeSummaryHandler = async (req, res) => {
  try {
    // Validate request (though no specific params)
    // feeSummarySchema.parse(req.query); // Not needed as we're getting from auth
    
    // Get student ID from authenticated user or from params (if admin/manager)
    const studentId = req.params.userId || req.user.id;
    
    // Get fee summary
    const feeSummary = await getStudentFeeSummary(studentId);
    
    return sendSuccess(res, feeSummary, 'Fee summary retrieved successfully');
  } catch (error) {
    console.error('Error getting student fee summary:', error);
    return sendError(res, 'Failed to retrieve fee summary', 500);
  }
};

/**
 * GET /api/fee/all-transactions
 * Get all fee transactions (admin/manager only)
 */
export const getAllFeeTransactionsHandler = async (req, res) => {
  try {
    const validatedData = getAllFeeTransactionsSchema.parse(req.query);
    
    // Calculate skip for pagination
    const skip = (validatedData.page - 1) * validatedData.limit;
    
    // Get all fee transactions
    const result = await getAllFeeTransactions({
      ...validatedData,
      skip,
      take: validatedData.limit,
    });
    
    return sendSuccess(res, {
      transactions: result.transactions,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / validatedData.limit),
      },
    }, 'Fee transactions retrieved successfully');
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors);
    }
    
    console.error('Error getting all fee transactions:', error);
    return sendError(res, 'Failed to retrieve fee transactions', 500);
  }
};
