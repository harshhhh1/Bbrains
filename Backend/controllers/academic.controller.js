import {
    createAssignment,
    getAssignments,
    submitAssignment,
    getSubmissions,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement
} from "../services/academic.service.js";

// Assignments
const createAssignmentHandler = async (req, res) => {
    try {
        const { courseId } = req.body; // or params, assuming body for now
        const result = await createAssignment(req.user.id, courseId, req.body);
        res.json({ status: "success", assignment: result });
    } catch (error) {
        console.error("Academic Error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getAssignmentsHandler = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await getAssignments(courseId);
        res.json({ status: "success", assignments: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const submitAssignmentHandler = async (req, res) => {
    try {
        const { id } = req.params; // assignmentId
        const { filePath } = req.body;
        const result = await submitAssignment(req.user.id, id, filePath);
        res.json({ status: "success", message: "Submitted successfully", submission: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getSubmissionsHandler = async (req, res) => {
    try {
        const { id } = req.params; // assignmentId
        const result = await getSubmissions(id);
        res.json({ status: "success", submissions: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Announcements
const createAnnouncementHandler = async (req, res) => {
    try {
        const result = await createAnnouncement(req.user.id, req.body);
        res.json({ status: "success", announcement: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getAnnouncementsHandler = async (req, res) => {
    try {
        const result = await getAnnouncements();
        res.json({ status: "success", announcements: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const deleteAnnouncementHandler = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteAnnouncement(id);
        res.json({ status: "success", message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export {
    createAssignmentHandler,
    getAssignmentsHandler,
    submitAssignmentHandler,
    getSubmissionsHandler,
    createAnnouncementHandler,
    getAnnouncementsHandler,
    deleteAnnouncementHandler
};
