// Define your auth controller methods here
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const users = [];

export const signup = async (req, res) => {
    const { email, password, password2, username } = req.body;

    //validate all fields
    if (!email || !password || !password2 || !username) {
        return res.status(400).send('All fields are required');
    }
    if (password !== password2) {
        return res.status(400).send('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword, username };
    users.push(newUser);

    console.log('signup working');
    return res.status(201).send('Signup successful');
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ email: user.email }, 'your_jwt_secret');
    res.cookie('token', token, { httpOnly: true });
    res.status(200).send('Login successful');
};

export const logout = (req, res) => {
    res.status(200).send('Logout endpoint');
};

export const getMe = (req, res) => {
    res.status(200).send('Get Me endpoint');
};

export const refreshToken = (req, res) => {
    res.status(200).send('Refresh Token endpoint');
};