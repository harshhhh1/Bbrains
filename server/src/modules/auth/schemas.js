import { z } from "zod";

export const registerSchema = z.object({
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, "Username must be alphanumeric with underscores"),
    email: z.string().email("Invalid email format").max(50),
    password: z.string().min(6, "Password must be at least 6 characters"),
    collegeId: z.number().int().positive().optional()
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
});

export const passwordUpdateSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters")
});