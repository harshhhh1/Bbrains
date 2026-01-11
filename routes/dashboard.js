 import express from 'express'
 const router = express.Router();

 import {user} from '../controllers/dashboard.js';
 // Define your auth routes here
 router.get('/user',user);
 
 export default router;           