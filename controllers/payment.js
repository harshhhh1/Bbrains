import express from 'express';
import { paymentHistory } from '../database.js';


export const paymenthistory = async (req,res) => {
    const { id } = req.body;
    try {
        const result=paymentHistory(id)
    } catch (error) {
        
    }
    res.json({ message: "Payment", result });
}
