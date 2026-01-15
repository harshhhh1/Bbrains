 import express from 'express'
 const router = express.Router();

 import {getAnnouncement, postAnnouncement} from '../controllers/annoncement.js';
 // Define your auth routes here
 router.get('/announcements',getAnnouncement);
 router.post('/postannouncement',postAnnouncement);
 
 export default router;           