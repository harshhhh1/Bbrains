 import express from 'express'
 const router = express.Router();

 import {paymenthistory} from '../controllers/payment.js';
 // Define your auth routes here
 router.get('/paymentHistory',paymenthistory);
 router.post('/products:id',products);
 
 export default router;           