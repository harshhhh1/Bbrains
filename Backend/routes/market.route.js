import express from 'express';
import { products, createProduct } from '../controllers/market.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/',products);
router.post('/create', verifyToken, createProduct);

export default router;