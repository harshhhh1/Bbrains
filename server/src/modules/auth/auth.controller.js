import bcrypt from "bcrypt";
import { z } from "zod";
import { findUserByEmail, createUser, getUserDetailsByID } from "../user/user.service.js";
import dotenv from "dotenv";
import { generateToken } from "../../utils/tokengen.js";
import { sendSuccess, sendCreated, sendError } from "../../utils/response.js";
import { createAuditLog } from "../../utils/auditLog.js";
import { isDatabaseUnavailableError } from "../../utils/prisma-errors.js";
import crypto from "crypto";
import prisma from "../../utils/prisma.js";
import { awardAchievement } from "../achievement/achievement.service.js";

dotenv.config();

const schemas = {
  register: z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric with underscores"),
    email: z.string().email("Invalid email format").max(50),
    password: z.string().min(6, "Password must be at least 6 characters"),
    collegeId: z.number().int().positive().optional()
  }),
  login: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  }),
  passwordUpdate: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters")
  })
};

const handleControllerError = (res, error, action) => {
  if (error.name === 'ZodError') {
    return sendError(res, 'Validation failed', 400, (error.issues || []).map(e => ({ field: e.path.join('.'), message: e.message })));
  }
  if (isDatabaseUnavailableError(error)) {
    console.error(`${action} database error:`, error);
    return sendError(res, 'Database temporarily unavailable.', 503);
  }
  console.error(error);
  return sendError(res, `${action} failed`, 500);
};

const register = async (req, res) => {
  try {
    const validated = schemas.register.parse(req.body);
    if (await findUserByEmail(validated.email)) return sendError(res, "User already exists", 409);

    const newUser = await createUser(
      crypto.randomUUID(),
      validated.username,
      validated.email,
      validated.collegeId || 45,
      await bcrypt.hash(validated.password, 10)
    );

    await createAuditLog(newUser.id, 'AUTH', 'REGISTER', 'User', newUser.id);
    
    // Award "First Steps" achievement
    await awardAchievement(newUser.id, 'First Steps');

    return sendCreated(res, { id: newUser.id, username: newUser.username }, "User registered successfully.");
  } catch (error) { return handleControllerError(res, error, "Registration"); }
};

const login = async (req, res) => {
  try {
    const validated = schemas.login.parse(req.body);
    const user = await findUserByEmail(validated.email);

    if (!user || !user.password || !(await bcrypt.compare(validated.password, user.password))) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = generateToken({ id: user.id, username: user.username, type: user.type });
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });

    await createAuditLog(user.id, 'AUTH', 'LOGIN', 'User', user.id);

    // Award "First Steps" achievement (handles bulk-created users on first login)
    await awardAchievement(user.id, 'First Steps');

    return sendSuccess(res, { user: await getUserDetailsByID(user.id), token }, "Login successful");
  } catch (error) { return handleControllerError(res, error, "Login"); }
};

const logout = async (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  return sendSuccess(res, null, "Logged out successfully");
};

const updatePassword = async (req, res) => {
  try {
    if (!req.user) return sendError(res, "Not authenticated", 401);
    const validated = schemas.passwordUpdate.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user?.password || !(await bcrypt.compare(validated.currentPassword, user.password))) {
      return sendError(res, "Current password incorrect", 401);
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: await bcrypt.hash(validated.newPassword, 10) }
    });

    await createAuditLog(req.user.id, 'AUTH', 'PASSWORD_UPDATE', 'User', req.user.id);
    return sendSuccess(res, null, "Password updated successfully");
  } catch (error) { return handleControllerError(res, error, "Password update"); }
};

export { register, login, logout, updatePassword };
