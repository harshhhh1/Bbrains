import { getUsersByRole, getUserByName, createTeacher } from "../services/user.service.js";
import bcrypt from "bcrypt";

const getStudents = async (req, res) => {
    try {
        const result = await getUsersByRole('student');
        res.json({ status: "success", students: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getTeachers = async (req, res) => {
    try {
        const result = await getUsersByRole('teacher');
        res.json({ status: "success", teachers: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getUserProfileByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ message: "Name required" });

        const result = await getUserByName(name);
        if (!result) return res.status(404).json({ message: "User not found" });

        res.json({ status: "success", user: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const addTeacher = async (req, res) => {
    try {
        const data = req.body;
        // Hash password before service call
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;

        const result = await createTeacher(data);
        res.json({ status: "success", teacher: result });
    } catch (error) {
        console.error("Add Teacher Error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

export { getStudents, getTeachers, getUserProfileByName, addTeacher };
