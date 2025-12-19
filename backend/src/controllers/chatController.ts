import { Request, Response } from 'express';
import { ChatRepository } from '../repositories/ChatRepository.js';

const chatRepo = new ChatRepository();

export const getMyChats = async (req: Request, res: Response) => {
    console.log("Запит чатів для користувача ID:", req.user?.id);
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: "Неавторизований користувач" });
        }

        const chats = await chatRepo.getUserChats(userId);

        res.json(chats);
    } catch (error) {
        console.error('Помилка в getMyChats:', error);
        res.status(500).json({ message: 'Помилка сервера при завантаженні чатів' });
    }
};