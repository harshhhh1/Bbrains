import { z } from 'zod';
import prisma from '../../utils/prisma.js';
import { createAuditLog } from '../../utils/auditLog.js';
import { createManualTransactionRecord, getRecordedTransactionsForActor, getTransactions, getTransactionById, getUserTransactions, getStudentDues } from './transaction.service.js';
import { sendSuccess, sendPaginated, sendError } from '../../utils/response.js';

const manualTransactionSchema = z.object({
    category: z.enum(['salary', 'fee']),
    targetUserId: z.string().min(1),
    amount: z.number().positive(),
    paymentMode: z.enum(['cash', 'cheque', 'upi', 'dd', 'bank_transfer', 'card', 'neft', 'rtgs', 'imps', 'other']),
    referenceId: z.string().max(100).optional(),
    note: z.string().max(255).optional(),
    paymentDate: z.string().min(1),
});

const formatZodErrors = (error) => {
    const issues = Array.isArray(error?.issues)
        ? error.issues
        : Array.isArray(error?.errors)
            ? error.errors
            : [];

    return issues.map((entry) => ({
        field: Array.isArray(entry?.path) ? entry.path.join('.') : '',
        message: entry?.message || 'Invalid value',
    }));
};

// GET /transactions/me
export const getMyTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const filters = {
            type: req.query.type,
            status: req.query.status,
            category: req.query.category,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            skip: (page - 1) * limit,
            take: limit,
        };

        const { transactions, total } = await getTransactions(req.user.id, filters);
        return sendPaginated(res, transactions, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch transactions', 500);
    }
};

// GET /transactions/recorded
export const getRecordedTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const filters = {
            type: req.query.type,
            status: req.query.status,
            category: req.query.category,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            skip: (page - 1) * limit,
            take: limit,
        };

        const { transactions, total } = await getRecordedTransactionsForActor(req.user, filters);
        return sendPaginated(res, transactions, { page, limit, total });
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch recorded transactions', 500);
    }
};

// GET /transactions/:id
export const getTransaction = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid transaction ID', 400);

        const transaction = await getTransactionById(id);
        if (!transaction) return sendError(res, 'Transaction not found', 404);

        // Check college boundary
        if (transaction.user?.collegeId !== req.user.collegeId) {
            return sendError(res, 'Transaction not found', 404);
        }

        // Check ownership
        if (
            transaction.userId !== req.user.id &&
            transaction.recordedById !== req.user.id &&
            req.user.type !== 'admin'
        ) {
            return sendError(res, 'Not authorized', 403);
        }

        return sendSuccess(res, transaction);
    } catch (error) {
        return sendError(res, 'Failed to fetch transaction', 500);
    }
};

// POST /transactions/manual
export const createManualTransaction = async (req, res) => {
    try {
        const validated = manualTransactionSchema.parse(req.body);
        const transaction = await createManualTransactionRecord(req.user, validated);

        await createAuditLog(req.user.id, 'FINANCE', 'CREATE', 'TransactionHistory', String(transaction?.id || ''), {
            after: {
                category: validated.category,
                targetUserId: validated.targetUserId,
                amount: validated.amount,
                paymentMode: validated.paymentMode,
                paymentDate: validated.paymentDate,
            },
        }, `Recorded ${validated.category} transaction`);

        return sendSuccess(res, transaction, 'Transaction recorded successfully', 201);
    } catch (error) {
        if (error.name === 'ZodError') {
            return sendError(res, 'Validation failed', 400, formatZodErrors(error));
        }

        console.error(error);
        return sendError(res, error?.message || 'Failed to record transaction', 400);
    }
};

// GET /transactions/user/:userId (admin only)
export const getUserTransactionsList = async (req, res) => {
    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: req.params.userId },
            select: { collegeId: true }
        });

        if (!targetUser || targetUser.collegeId !== req.user.collegeId) {
            return sendError(res, 'User not found or inaccessible', 404);
        }

        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const filters = {
            type: req.query.type,
            status: req.query.status,
            category: req.query.category,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };

        const { transactions, total } = await getUserTransactions(req.params.userId, (page - 1) * limit, limit, filters);
        return sendPaginated(res, transactions, { page, limit, total });
    } catch (error) {
        return sendError(res, 'Failed to fetch transactions', 500);
    }
};

// GET /transactions/dues or /transactions/user/:userId/dues
export const getDues = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        
        // If an admin/manager is requesting for another user, verify college boundary
        if (req.params.userId && req.params.userId !== req.user.id) {
            const targetUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { collegeId: true }
            });
            if (!targetUser || targetUser.collegeId !== req.user.collegeId) {
                return sendError(res, 'User not found or inaccessible', 404);
            }
        }

        const duesData = await getStudentDues(userId);
        return sendSuccess(res, duesData);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch dues', 500);
    }
};

// POST /transactions/pay-fee
export const payFee = async (req, res) => {
    try {
        // Students can pay their own fee
        const { amount, paymentMode, referenceId, note } = req.body;
        
        if (!amount || amount <= 0) {
            return sendError(res, 'Invalid amount', 400);
        }

        const payload = {
            category: 'fee',
            targetUserId: req.user.id,
            amount: Number(amount),
            paymentMode: paymentMode || 'other',
            referenceId: referenceId || '',
            note: note || 'Self-initiated fee payment',
            paymentDate: new Date().toISOString()
        };

        // Reuse the record logic - it will create a credit for institution and debit for student
        const transaction = await createManualTransactionRecord(req.user, payload);

        await createAuditLog(req.user.id, 'FINANCE', 'CREATE', 'TransactionHistory', String(transaction?.id || ''), {
            after: payload
        }, `Self-recorded fee payment`);

        return sendSuccess(res, transaction, 'Fee payment recorded successfully', 201);
    } catch (error) {
        console.error(error);
        return sendError(res, error?.message || 'Failed to record fee payment', 400);
    }
};

