import {Request, Response} from "express";
import {MessageRepository} from "../repositories/MessageRepository.js";
import {ChatRepository} from "../repositories/ChatRepository.js";
import {getIO} from "../socket.js";
import redisClient from "../redisClient.js";

const messageRepo = new MessageRepository();
const chatRepo = new ChatRepository();

// ==== Send a message ====
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const {chatId, receiverId, text, type = "text"} = req.body;
        const senderId = req.user?.id;

        if (!senderId || (!chatId && !receiverId) || !text) {
            return res.status(400).json({error: "Missing required fields (chatId or receiverId)"});
        }

        let finalChatId = chatId;

        if (!finalChatId && receiverId) {
            let chat = await chatRepo.findPrivateChat(senderId, receiverId);
            if (!chat) {
                chat = await chatRepo.createPrivateChat(senderId, receiverId);
            }
            finalChatId = chat.id;
        }

        const newMessage = await messageRepo.create(finalChatId, senderId, text, type);

        const io = getIO();
        io.to(`chat_${finalChatId}`).emit("receive_message", newMessage);

        try {
            const memberIds = await chatRepo.getChatMemberIds(finalChatId);

            const cacheKeysToDelete = memberIds.map(
                (id) => `chat:${finalChatId}:user:${id}:messages`
            );
            if (cacheKeysToDelete.length > 0) {
                await redisClient.del(...cacheKeysToDelete);
            }
        } catch (redisErr) {
            console.error("Помилка очищення кешу Redis при відправці повідомлення:", redisErr);
        }

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Error in sendMessage:", err);
        res.status(500).json({error: "Failed to send message"});
    }
};

// ==== Get messages by chat ====
export const getMessagesByChat = async (req: Request, res: Response) => {
    try {
        const chatId = parseInt(req.params.chatId, 10);
        const userId = req.user?.id;

        const cursor = req.query.cursor as string | undefined;
        const limit = parseInt(req.query.limit as string, 10) || 30;

        if (!userId) {
            return res.status(401).json({error: "Неавторизований користувач"});
        }
        if (isNaN(chatId)) {
            return res.status(400).json({error: "Некоректний ідентифікатор чату"});
        }

        const isFirstPage = !cursor;
        const cacheKey = `chat:${chatId}:user:${userId}:messages`;

        if (isFirstPage) {
            const chatDetails = await chatRepo.getChatDetails(chatId, userId);
            await messageRepo.markAsRead(chatId, userId);

            try {
                const cachedMessages = await redisClient.get(cacheKey);
                if (cachedMessages) {
                    return res.json({
                        messages: JSON.parse(cachedMessages),
                        chatDetails
                    });
                }
            } catch (redisError) {
                console.error("Redis Cache Error:", redisError);
            }

            const messages = await messageRepo.findByChat(chatId, userId, limit);

            try {
                await redisClient.setex(cacheKey, 3600, JSON.stringify(messages));
            } catch (redisError) {
                console.error("Redis Cache Save Error:", redisError);
            }

            return res.json({messages, chatDetails});
        } else {
            const messages = await messageRepo.findByChat(chatId, userId, limit, cursor);

            return res.json({messages});
        }

    } catch (err) {
        console.error("Error in getMessagesByChat:", err);
        res.status(500).json({error: "Внутрішня помилка сервера"});
    }
};

// ==== Delete a message ====
export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const messageId = parseInt(req.params.id);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({error: "Неавторизований"});
        }

        const deletedMessage = await messageRepo.delete(messageId, userId);

        if (!deletedMessage) {
            return res.status(404).json({error: "Повідомлення не знайдено або у вас немає прав"});
        }

        const chatId = deletedMessage.chat_id;
        const io = getIO();

        io.to(`chat_${chatId}`).emit("message_deleted", {
            messageId,
            chatId,
            is_deleted: true
        });
        try {
            const memberIds = await chatRepo.getChatMemberIds(chatId);
            const cacheKeysToDelete = memberIds.map(
                (id) => `chat:${chatId}:user:${id}:messages`
            );
            if (cacheKeysToDelete.length > 0) {
                await redisClient.del(...cacheKeysToDelete);
            }
        } catch (redisErr) {
            console.error("Помилка Redis при видаленні:", redisErr);
        }

        res.json({message: "Повідомлення видалено", messageId});
    } catch (err) {
        console.error("Error in deleteMessage:", err);
        res.status(500).json({error: "Помилка бази даних"});
    }
};