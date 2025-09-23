import express from "express";
import { getMessages, getMessagesByUser, sendMessage, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/", getMessages);
router.get("/user/:userId", getMessagesByUser);
router.post("/", sendMessage);
router.delete("/:id", deleteMessage);

export default router;
