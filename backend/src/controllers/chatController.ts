import {Request, Response} from 'express';
import {ChatRepository} from '../repositories/ChatRepository.js';

const chatRepo = new ChatRepository();

export const getMyChats = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }
        const chats = await chatRepo.getUserChats(userId);

        res.json(chats);
    } catch (error) {
        console.error('Помилка в getMyChats:', error);
        res.status(500).json({message: 'Помилка сервера при завантаженні чатів'});
    }
};
export const getChatDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const chatId = parseInt(req.params.chatId);

        if (!userId || !chatId) {
            return res.status(400).json({message: "Недостатньо даних"});
        }
        const chat = await chatRepo.getChatByIdForSidebar(chatId, userId);

        if (!chat) {
            return res.status(404).json({message: "Чат не знайдено"});
        }

        res.json(chat);
    } catch (error) {
        console.error('Помилка в getChatDetails:', error);
        res.status(500).json({message: 'Помилка сервера'});
    }
};
export const createOrOpenChat = async (req: Request, res: Response) => {
    try {
        const myId = req.user?.id;
        const {targetUserId} = req.body;

        if (!myId || !targetUserId) {
            return res.status(400).json({message: "Некоректні дані"});
        }

        let chat = await chatRepo.findPrivateChat(myId, targetUserId);

        if (!chat) {
            chat = await chatRepo.createPrivateChat(myId, targetUserId);
        }
        const fullChatData = await chatRepo.getChatByIdForSidebar(chat.id, myId);

        res.json(fullChatData);

    } catch (error) {
        console.error('Помилка в createOrOpenChat:', error);
        res.status(500).json({message: 'Не вдалося відкрити чат'});
    }
};
export const deleteChat = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const chatId = parseInt(req.params.chatId);
        const {forEveryone} = req.body;

        if (!userId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }

        if (!chatId || isNaN(chatId)) {
            return res.status(400).json({message: "Некоректний ID чату"});
        }

        await chatRepo.deleteChat(chatId, userId, !!forEveryone);

        res.json({message: "Чат успішно видалено"});

    } catch (error: any) {
        console.error('Помилка в deleteChat:', error);

        if (error.message === "Access denied or chat not found") {
            return res.status(403).json({message: "Доступ заборонено або чат не знайдено"});
        }

        res.status(500).json({message: 'Не вдалося видалити чат'});
    }
};