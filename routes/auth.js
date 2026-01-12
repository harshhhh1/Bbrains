 import express from 'express'
 const router = express.Router();

 import {signin, signup, userdata} from '../controllers/auth.js';
 // Define your auth routes here
 router.post('/signup',signup);
 router.post('/signin',signin);
 router.get('/dashboard',userdata);
 export default router;           