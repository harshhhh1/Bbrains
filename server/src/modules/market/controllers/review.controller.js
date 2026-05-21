import { sendSuccess, sendCreated, sendError } from "../../../utils/response.js";
import { createAuditLog } from "../../../utils/auditLog.js";
import prisma from "../../../utils/prisma.js";

// GET /market/products/:id/reviews - Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            username: true,
            userDetails: {
              select: { firstName: true, lastName: true, avatar: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalReviews = reviews.length;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumRating = 0;
    reviews.forEach(r => {
      if (ratingCounts[r.rating] !== undefined) {
        ratingCounts[r.rating]++;
        sumRating += r.rating;
      }
    });
    const averageRating = totalReviews > 0 ? parseFloat((sumRating / totalReviews).toFixed(1)) : 0;

    return sendSuccess(res, {
      reviews,
      stats: {
        averageRating,
        totalReviews,
        ratingCounts
      }
    });
  } catch (error) {
    console.error('[getProductReviews] Error:', error);
    return sendError(res, 'Failed to fetch reviews', 500);
  }
};

// GET /market/products/:id/can-review - Check if user can review (has purchased)
export const checkCanReview = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    const purchase = await prisma.library.findFirst({
      where: {
        productId,
        userId: req.user.id
      }
    });

    const orderWithProduct = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: req.user.id }
      }
    });

    const hasPurchased = !!purchase || !!orderWithProduct;
    return sendSuccess(res, { hasPurchased });
  } catch (error) {
    console.error('[checkCanReview] Error:', error);
    return sendError(res, 'Failed to check purchase status', 500);
  }
};

// POST /market/products/:id/reviews - Create a review
export const createReview = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return sendError(res, 'Invalid product ID', 400);

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }

    const purchase = await prisma.library.findFirst({
      where: { productId, userId: req.user.id }
    });
    const orderWithProduct = await prisma.orderItem.findFirst({
      where: { productId, order: { userId: req.user.id } }
    });
    const hasPurchased = !!purchase || !!orderWithProduct;

    if (!hasPurchased) {
      return sendError(res, 'You must purchase this product to leave a review', 403);
    }

    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: req.user.id }
    });
    if (existingReview) {
      return sendError(res, 'You have already reviewed this product', 400);
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating,
        comment: comment || ''
      },
      include: {
        user: {
          select: {
            username: true,
            userDetails: { select: { firstName: true, lastName: true, avatar: true } }
          }
        }
      }
    });

    await createAuditLog(req.user.id, 'MARKET', 'CREATE_REVIEW', 'Review', review.id, { productId, rating });
    return sendCreated(res, review, 'Review submitted');
  } catch (error) {
    console.error('[createReview] Error:', error);
    return sendError(res, 'Failed to create review', 500);
  }
};
