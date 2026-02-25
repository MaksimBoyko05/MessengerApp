import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {
    sendMessage,
    getMessagesByChat,
    deleteMessage
} from "../controllers/messageController.js";

const router = express.Router();

// POST/api/messages
router.post("/", protect, sendMessage);

// GET /api/messages
router.get("/:chatId", protect, getMessagesByChat);

// DELETE /api/messages
router.delete("/:id", protect, deleteMessage);

export default router;