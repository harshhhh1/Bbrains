import express from 'express';
import { 
    createSuggestion, 
    getSuggestions, 
    updateStatus, 
    removeSuggestion 
} from './suggestion.controller.js';
import verifyToken from '../../middleware/verifyToken.js';
import checkPermission from '../../middleware/checkPermission.js';

const router = express.Router();

router.get('/', verifyToken, getSuggestions);
router.post('/', verifyToken, createSuggestion);
router.put('/:id/status', verifyToken, checkPermission('manage_suggestions'), updateStatus);
router.delete('/:id', verifyToken, removeSuggestion);

export default router;
