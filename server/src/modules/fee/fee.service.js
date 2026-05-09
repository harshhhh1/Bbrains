import prisma from '../../utils/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';

/**
 * Get fee summary for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Fee summary data
 */
export const getStudentFeeSummary = async (studentId) => {
  try {
    // Get all successful fee transactions for this student (debit transactions)
    const feeTransactions = await prisma.transactionHistory.findMany({
      where: {
        userId: studentId,
        category: 'fee',
        type: 'debit',
        status: 'success',
      },
      select: {
        amount: true,
        transactionDate: true,
        note: true,
        referenceId: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    // Calculate total paid amount
    const totalPaid = feeTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    // Get student info
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        username: true,
        userDetails: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        college: {
          select: {
            name: true,
          },
        },
        enrollments: {
          select: {
            course: {
              select: {
                name: true,
                feePerStudent: true,
                createdAt: true,
                durationValue: true,
                durationUnit: true,
              },
            },
          },
        },
      },
    });

    let totalFee = 0;
    if (student?.enrollments && student.enrollments.length > 0) {
      totalFee = student.enrollments.reduce((sum, e) => sum + Number(e.course.feePerStudent || 0), 0);
    }
    const remainingAmount = Math.max(0, totalFee - totalPaid);

    return {
      student,
      totalFee,
      totalPaid,
      remainingAmount,
      feeTransactions,
    };
  } catch (error) {
    console.error('Error getting student fee summary:', error);
    throw error;
  }
};

/**
 * Get all fee transactions (for admins/managers)
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Paginated fee transactions
 */
export const getAllFeeTransactions = async (filters = {}) => {
  try {
    const where = {
      category: 'fee',
      ...filters,
    };

    const skip = filters.skip || 0;
    const take = Math.min(filters.take || 20, 100);

    const [transactions, total] = await prisma.$transaction([
      prisma.transactionHistory.findMany({
        where,
        skip,
        take,
        orderBy: { transactionDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              userDetails: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          relatedUser: {
            select: {
              id: true,
              username: true,
              userDetails: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          recordedByUser: {
            select: {
              id: true,
              username: true,
              userDetails: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.transactionHistory.count({ where }),
    ]);

    return {
      transactions,
      total,
    };
  } catch (error) {
    console.error('Error getting all fee transactions:', error);
    throw error;
  }
};
