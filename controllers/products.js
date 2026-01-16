import express from 'express';
import { getproducts } from '../database.js';


export const products = async (req,res) => {
    const { id } = req.params;
    if(id){
        const result = await getproducts(id);
    }
    else{
        const result = await getproducts();    
    }
    res.json({ message: "Announcement created", result });
}
