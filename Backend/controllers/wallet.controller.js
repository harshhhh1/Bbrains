import { transferFunds, getTransactionHistory, getWalletDetails } from "../services/wallet.service.js";

const transferHandler = async (req, res) => {
    try {
        const { recipientWalletId, amount, note, pin } = req.body;
        const senderId = req.user.id;

        const result = await transferFunds(senderId, recipientWalletId, amount, note, pin);
        res.json({ status: "success", message: "Transfer successful", transactions: result });
    } catch (error) {
        console.error("Wallet Error:", error);
        res.status(400).json({ status: "error", message: error.message });
    }
};

const getHistoryHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await getTransactionHistory(userId);
        res.json({ status: "success", history: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const getWalletHandler = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await getWalletDetails(userId);
        res.json({ status: "success", wallet: result });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export { transferHandler, getHistoryHandler, getWalletHandler };
