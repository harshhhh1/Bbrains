import { getUserDetailsByID } from "../services/user.service.js";
import jwt from 'jsonwebtoken';

const getDashboardData = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userData = await getUserDetailsByID(decoded.id);

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            status: "success",
            data: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch user data", error: error.message });
    }
}

export { getDashboardData }