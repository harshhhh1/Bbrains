import { getUserLogs } from "../services/log.service.js";

const getLogsHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await getUserLogs(userId);
        res.json({ status: "success", logs: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export { getLogsHandler };
