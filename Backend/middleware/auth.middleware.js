import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch current user type from DB for accurate RBAC
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, username: true, type: true, collegeId: true }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default verifyToken;
