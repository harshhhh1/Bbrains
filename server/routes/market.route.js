import express from 'express';
import {
    getAllProducts, getProduct, createProduct, updateProduct, deleteProduct,
    searchProductsHandler, addToCartHandler, getCartHandler,
    removeFromCartHandler, checkoutHandler
} from '../controllers/market.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// Products
router.get('/products', verifyToken, getAllProducts);
router.get('/products/search', verifyToken, searchProductsHandler);
router.get('/products/:id', verifyToken, getProduct);
router.post('/products', verifyToken, authorize('teacher', 'admin'), createProduct);
router.put('/products/:id', verifyToken, authorize('teacher', 'admin'), updateProduct);
router.delete('/products/:id', verifyToken, authorize('admin'), deleteProduct);

// Cart
router.get('/cart', verifyToken, getCartHandler);
router.post('/cart', verifyToken, addToCartHandler);
router.delete('/cart/:productId', verifyToken, removeFromCartHandler);

// Checkout
router.post('/checkout', verifyToken, checkoutHandler);

export default router;