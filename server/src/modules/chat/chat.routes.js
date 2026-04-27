import express from "express";
import verifyToken from "../../middleware/auth.middleware.js";
import {
    getChatMembers,
    getChatMessages,
    searchChatMessages,
    getMyChatProfile,
    createChatMessage,
    updateChatMessageById,
    deleteChatMessageById
} from "./chat.controller.js";

const router = express.Router();

router.get("/messages", verifyToken, getChatMessages);
router.get("/", verifyToken, getChatMessages);
router.get("/messages/search", verifyToken, searchChatMessages);
router.get("/search", verifyToken, searchChatMessages);
router.post("/messages", verifyToken, createChatMessage);
router.post("/", verifyToken, createChatMessage);
router.put("/messages/:id", verifyToken, updateChatMessageById);
router.put("/:id", verifyToken, updateChatMessageById);
router.delete("/messages/:id", verifyToken, deleteChatMessageById);
router.delete("/:id", verifyToken, deleteChatMessageById);
router.get("/members", verifyToken, getChatMembers);
router.get("/profile/me", verifyToken, getMyChatProfile);
router.get("/me", verifyToken, getMyChatProfile);

export default router;

