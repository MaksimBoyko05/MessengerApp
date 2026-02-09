import {Request, Response} from "express";
import {MessageRepository} from "../repositories/MessageRepository.js";
import {ChatRepository} from "../repositories/ChatRepository.js";
import {getIO} from "../socket.js";

const messageRepo = new MessageRepository();
const chatRepo = new ChatRepository();

// ==== Send a message ====
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const {receiverId, text} = req.body;
        const senderId = req.user?.id;

        if (!senderId || !receiverId || !text) {
            return res.status(400).json({error: "Missing required fields"});
        }
        let chat = await chatRepo.findPrivateChat(senderId, receiverId);
        if (!chat) {
            chat = await chatRepo.createPrivateChat(senderId, receiverId);
        }
        const newMessage = await messageRepo.create(chat.id, senderId, text);
        const io = getIO();

        io.to(`chat_${chat.id}`).emit("receive_message", newMessage);
        

        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to send message"});
    }
};

// ==== Get messages by chat ====
export const getMessagesByChat = async (req: Request, res: Response) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({error: "Unauthorized"});
        }
        const companion = await chatRepo.getCompanionInfo(chatId, userId);
        await messageRepo.markAsRead(chatId, userId);
        const messages = await messageRepo.findByChat(chatId);
        res.json({
            messages,
            companion
        });
    } catch (err) {
        console.error("Error in getMessagesByChat:", err);
        res.status(500).json({error: "Database error"});
    }
};

// ==== Delete a message ====
export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const messageId = parseInt(req.params.id);
        const deletedCount = await messageRepo.delete(messageId);

        if (deletedCount === 0) {
            return res.status(404).json({error: "Message not found"});
        }

        res.json({message: "Message deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
};