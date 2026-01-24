import express from 'express';
import bcrypt from 'bcrypt'
import prisma from '../utils/prisma.js';
import { generateToken } from '../utils/tokengen.js';

const register = async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;

  // Basic validation
  if (!username || !email || !password || !confirmpassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Check existing user
  const userExists = await prisma.user.findUnique({
    where: { email }
  });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  await prisma.user.create({
    data: {
      username,
      email,
      collegeId:1,
      password: hashedPassword
    }
  });

  res.status(201).json({
    status: "success",
    message: "User created"
  });
};
const login = async (req, res) => {
    const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    username: user.username
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });

  res.redirect('/dashboard');
  res.json({
    status: "success",
    message: "Login successful"
  });
  res.redirect('/dashboard');

};
const logout = async (req, res) => {
  // Logout logic here
  res.send('User logged out');
};



export { register, login, logout };