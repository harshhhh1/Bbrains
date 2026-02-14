import { updateUser, deleteUser, claimDailyRewards } from "../services/user_actions.service.js";

const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const result = await updateUser(id, data);
        res.json({
            status: "success",
            user: result
        });
    } catch (error) {
        console.error("User Action Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to update user",
            error: error.message
        });
    }
}

const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteUser(id);
        res.json({
            status: "success",
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("User Action Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to delete user",
            error: error.message
        });
    }
}

const dailyClaim = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user is authenticated
        const result = await claimDailyRewards(userId);
        res.json({
            status: "success",
            message: "Daily rewards claimed successfully",
            rewards: result
        });
    } catch (error) {
        console.error("User Action Error:", error);
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
}

export { editUser, removeUser, dailyClaim };
