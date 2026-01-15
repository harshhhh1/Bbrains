import express from 'express';
import { announcement, postAnnouncement as dbPostAnnouncement, updateAnnouncement } from '../database.js';


export const postAnnouncement= async (req,res) => {
    const { OP, title, content } = req.body;
    const result = await dbPostAnnouncement(OP, title, content);
    res.json({ message: "Announcement created", result });
}

export const editAnnouncement= async (req,res) => {
    const { id, title, content } = req.body;
    const result = await updateAnnouncement(id, title, content);
    res.json({ message: "Announcement updated", result });
}

export const getAnnouncement= async (req,res) => {
    
    const announcements = await announcement();

    res.json({
        "message":"announcement fetched",
        announcements
   })
       res.send(announcements.message)
}
