import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateToken } from "../utils/tokengen.js";

dotenv.config();

/* =========================
   REGISTER
========================= */
const register = async (req, res) => {
  try {
    const { username, email, password, confirmpassword } = req.body;

    if (!username || !email || !password || !confirmpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username: username,
        email: email,
        collegeId: 6,
        password: hashedPassword
      }
    });

    res.status(201).json({
      status: "success",
      message: "User created"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const token = generateToken({
      id: user.id,
      username: user.username
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.json({
      status: "success",
      message: "Login successful"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   GET USER DATA
========================= */
const getuserdata = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        type: true,
        college: {
          select: {
            name: true,
            regNo: true
          }
        },
        userDetails: {
          select: {
            avatar: true,
            firstName: true,
            lastName: true,
            sex: true,
            dob: true,
            phone: true,
            address: {
              select: {
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                postalCode: true,
                country: true
              }
            }
          }
        },
        roles: {
          select: {
            role: {
              select: {
                name: true,
                description: true
              }
            }
          }
        },
        wallet: {
          select: {
            id:true,
            balance: true
          }
        },
        xp: {
          select: {
            xp: true,
            level: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      status: "success",
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Invalid or expired token",
      error: error.message || error
    });
  }
};

/* =========================
   LOGOUT
========================= */
const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict"
  });

  res.json({
    status: "success",
    message: "Logged out successfully"
  });
};

export { register, login, logout, getuserdata };
