import express from 'express';
import { getMyOrders, getOrder, listAllOrders, deliverOrder, updateOrderStatusHandler } from './order.controller.js';
import verifyToken from '../../middleware/auth.middleware.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.get('/me', verifyToken, getMyOrders);
router.get('/all', verifyToken, checkPermission('manage_product'), listAllOrders);
router.get('/:id', verifyToken, getOrder);
router.post('/:id/deliver', verifyToken, deliverOrder);
router.put('/:id/status', verifyToken, checkPermission('manage_product'), updateOrderStatusHandler);

export default router;
