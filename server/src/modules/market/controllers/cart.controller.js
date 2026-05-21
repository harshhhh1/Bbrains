import { addToCart, getCart, removeFromCart, checkout, buyNow } from "../market.service.js";
import { sendSuccess, sendCreated, sendError } from "../../../utils/response.js";
import { createAuditLog } from "../../../utils/auditLog.js";
import prisma from "../../../utils/prisma.js";
import { cartItemSchema, buyNowSchema } from "../schemas.js";

// POST /market/cart
export const addToCartHandler = async (req, res) => {
  try {
    const validated = cartItemSchema.parse(req.body);
    const cartItem = await addToCart(req.user.id, validated.productId, validated.quantity);
    return sendCreated(res, cartItem, 'Added to cart');
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, (error.issues || []).map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    return sendError(res, 'Failed to add to cart', 500);
  }
};

// GET /market/cart
export const getCartHandler = async (req, res) => {
  try {
    const items = await getCart(req.user.id);
    const validItems = items.filter(item => item.product);
    return sendSuccess(res, validItems);
  } catch (error) {
    console.error('[getCartHandler] Error:', error);
    return sendError(res, error.message || 'Failed to fetch cart', 500);
  }
};

// DELETE /market/cart/:productId or /market/cart/:cartItemId
export const removeFromCartHandler = async (req, res) => {
  try {
    let cartItemId = parseInt(req.params.cartItemId);

    if (isNaN(cartItemId)) {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) return sendError(res, 'Invalid cart item ID', 400);
      const cartItem = await prisma.cart.findFirst({
        where: {
          userId: req.user.id,
          productId
        },
        select: { id: true }
      });
      if (!cartItem) return sendError(res, 'Cart item not found', 404);
      cartItemId = cartItem.id;
    }

    await removeFromCart(req.user.id, cartItemId);
    return sendSuccess(res, null, 'Removed from cart');
  } catch (error) {
    return sendError(res, error.message || 'Failed to remove from cart', 400);
  }
};

// POST /market/checkout
export const checkoutHandler = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return sendError(res, 'PIN required for checkout', 400);

    const result = await checkout(req.user.id, pin);
    await createAuditLog(req.user.id, 'MARKET', 'CHECKOUT', 'Order', 'batch');
    return sendSuccess(res, result, 'Checkout successful');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// POST /market/buy-now
export const buyNowHandler = async (req, res) => {
  try {
    const validated = buyNowSchema.parse(req.body);
    const result = await buyNow(req.user.id, validated.productId, validated.quantity, validated.pin);
    await createAuditLog(req.user.id, 'MARKET', 'BUY_NOW', 'Order', result.id, {
      productId: validated.productId,
      quantity: validated.quantity
    });
    return sendSuccess(res, result, 'Purchase successful');
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, (error.issues || []).map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    return sendError(res, error.message || 'Failed to purchase', 400);
  }
};
