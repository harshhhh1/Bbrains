import express from 'express';
import bcrypt from 'bcrypt'
import prisma from '../utils/prisma.js';

const getuserdata = async (req, res) => {
    // Logic to get user data for dashboard
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}