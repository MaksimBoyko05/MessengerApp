import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {
    sendMessage,
    getMessagesByChat,
    deleteMessage
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, getMessagesByChat);
router.delete("/:id", protect, deleteMessage);

export default router;