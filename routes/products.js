 import express from 'express'
 const router = express.Router();

 import {products} from '../controllers/products.js';
 // Define your auth routes here
 router.get('/products',products);
 router.post('/products:id',products);
 
 export default router;           