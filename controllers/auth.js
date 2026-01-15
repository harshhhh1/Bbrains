import bcrypt from 'bcrypt'
import validator from 'validator'
import { saveUser, showAllUsers, checkUsername, login, getUserData } from '../database.js';
import express from 'express';
import cookieParser from 'cookie-parser';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


export const signup = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email) return res.status(400).send("Email is required");
        if (!username) return res.status(400).send("Username is required");
        if (!password) return res.status(400).send("Password is required");

        if (!validator.isEmail(email)) {
            return res.status(400).send("Invalid email format");
        }

        const usernameExists = await checkUsername(username);
        if (usernameExists) {
            return res.status(400).send("Username already exists");
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10);
            await saveUser(email,username,hashedPassword)

        res.status(201).json({ message: "User registered successfully" });
    }

        
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error: ",err);
    }
};



export const signin = async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).send("Email is required");
    }
    if (!password) {
        return res.status(400).send("Password is required");
    }
    // const userpassword=
     const isMatch = await login(username,password);

     if(isMatch){
        res.cookie('username', username, { httpOnly: true });
        return res.redirect('/dashboard');
        res.send(`Signin page working for email: ${username} amd has a password `);
     }
     else{
        res.status(401).send("Invalid username or password");
     }
    
}

export const userdata = async (req, res) => {
    const username = req.cookies.username;

    if (!username) {
        return res.status(401).send("Not authenticated");
    }

    const data = await getUserData(username);

    res.json({
        message: "User data retrieved successfully",
        data
    });
};
