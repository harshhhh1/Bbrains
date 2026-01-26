import express from 'express';
import { getLogsHandler } from '../controllers/log.controller.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getLogsHandler);

export default router;
