import bcrypt from "bcrypt";
import { z } from "zod";
import { findUserByEmail, createUser, getUserDetailsByID } from "../services/user.service.js";
import dotenv from "dotenv";
import { generateToken } from "../utils/tokengen.js";
import { getRandomAvatar } from "../utils/randomavatar.js";
import { sendSuccess, sendCreated, sendError } from "../utils/response.js";
import { createAuditLog } from "../utils/auditLog.js";

dotenv.config();

// Zod Schemas
const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric with underscores"),
  email: z.string().email("Invalid email format").max(50),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmpassword: z.string(),
  collegeId: z.number().int().positive().optional()
}).refine(data => data.password === data.confirmpassword, {
  message: "Passwords do not match",
  path: ["confirmpassword"]
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

/* =========================
   REGISTER
========================= */
const register = async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);

    const userExists = await findUserByEmail(validated.email);
    if (userExists) {
      return sendError(res, "User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);
    const collegeId = validated.collegeId || 45;

    const newUser = await createUser(validated.username, validated.email, collegeId, hashedPassword, getRandomAvatar());

    await createAuditLog(newUser.id, 'AUTH', 'REGISTER', 'User', newUser.id);

    return sendCreated(res, { id: newUser.id, username: newUser.username }, "User registered successfully");
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    console.error(error);
    return sendError(res, "Registration failed", 500);
  }
};

/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await findUserByEmail(validated.email);
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(validated.password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Include type in JWT for RBAC
    const token = generateToken({
      id: user.id,
      username: user.username,
      type: user.type
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "strict"
    });

    const userData = await getUserDetailsByID(user.id);

    await createAuditLog(user.id, 'AUTH', 'LOGIN', 'User', user.id);

    return res.redirect("/dashboard");
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    }
    console.error(error);
    return sendError(res, "Login failed", 500);
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

  return sendSuccess(res, null, "Logged out successfully");
};

export { register, login, logout };
