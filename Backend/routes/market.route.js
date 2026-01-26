import express from 'express';
import { products, createProduct, editProduct, removeProduct, searchProduct, addItemToCart, getUserCart, removeCartItem, checkoutHandler } from '../controllers/market.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', products);
router.post('/create', verifyToken, createProduct);
router.put('/edit/:id', verifyToken, editProduct);
router.delete('/delete/:id', verifyToken, removeProduct);

router.get('/search', searchProduct);

// Cart Routes
router.post('/cart/add', verifyToken, addItemToCart);
router.get('/cart', verifyToken, getUserCart);
router.delete('/cart/remove/:id', verifyToken, removeCartItem);

router.post('/checkout', verifyToken, checkoutHandler);

export default router;