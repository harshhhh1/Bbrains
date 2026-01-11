import express from 'express'
const router = express.Router();

import * as productController from '../controllers/product.controller.js';

// Define your product routes here
router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.get('/:productId', productController.getProductById);
router.put('/:productId', productController.updateProduct);
router.delete('/:productId', productController.deleteProduct);

export default router;