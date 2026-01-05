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