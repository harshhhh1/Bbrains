import bcrypt from "bcrypt";
import { findUserByEmail, createUser, getUserDetailsByID } from "../services/user.service.js";
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

    const userExists = await findUserByEmail(email);

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(username, email, 6, hashedPassword);

    res.status(201).json({
      status: "success",
      message: "User created"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed", error: error.message });
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

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
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

    const userData = await getUserDetailsByID(user.id);

    res.json({
      status: "success",
      message: "Login successful",
      data: userData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed", error: error.message });
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

export { register, login, logout };
