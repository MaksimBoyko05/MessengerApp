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
export const createGroupChat = async (req: Request, res: Response) => {
    try {
        const {name, memberIds} = req.body;
        const creatorId = (req as any).user?.id;

        if (!name || !memberIds || !Array.isArray(memberIds)) {
            return res.status(400).json({message: "Назва групи та список учасників  обов'язкові"});
        }

        if (memberIds.length === 0) {
            return res.status(400).json({message: "Група повинна мати хоча б одного учасника крім вас"});
        }
        const newChat = await chatRepo.createGroupChat(creatorId, name, memberIds);

        res.status(201).json({
            message: "Групу успішно створено",
            chat: newChat
        });

    } catch (error) {
        console.error("Помилка створення групи:", error);
        res.status(500).json({message: "Не вдалося створити групу"});
    }
};
export const addMembersToGroup = async (req: Request, res: Response) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const {memberIds} = req.body;
        const currentUserId = req.user?.id;

        if (!currentUserId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }

        if (!chatId || isNaN(chatId)) {
            return res.status(400).json({message: "Некоректний ID чату"});
        }

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({message: "Список учасників порожній або некоректний"});
        }
        await chatRepo.addMembersToGroupChat(chatId, currentUserId, memberIds);

        res.json({message: "Учасників успішно додано до групи"});

    } catch (error: any) {
        console.error('Помилка в addMembersToGroup:', error);

        if (error.message === "Access denied: only admins can add members") {
            return res.status(403).json({message: "Тільки адміністратори можуть додавати нових учасників"});
        }
        if (error.message === "You are not a member of this chat") {
            return res.status(403).json({message: "Ви не є учасником цього чату"});
        }
        if (error.message === "Chat not found or is not a group") {
            return res.status(404).json({message: "Групу не знайдено"});
        }

        res.status(500).json({message: 'Не вдалося додати учасників'});
    }
};
export const updateGroupAvatar = async (req: Request, res: Response) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const currentUserId = req.user?.id;

        if (!currentUserId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }

        if (!chatId || isNaN(chatId)) {
            return res.status(400).json({message: "Некоректний ID чату"});
        }

        if (!req.file) {
            return res.status(400).json({message: "Файл зображення не завантажено"});
        }

        const avatarUrl = `/avatars/${req.file.filename}`;

        await chatRepo.updateGroupAvatar(chatId, currentUserId, avatarUrl);

        res.json({
            message: "Аватарку групи успішно оновлено",
            avatar_url: avatarUrl
        });

    } catch (error: any) {
        console.error('Помилка в updateGroupAvatar:', error);

        if (error.message === "Access denied: only admins can change avatar") {
            return res.status(403).json({message: "Тільки адміністратори можуть змінювати аватарку групи"});
        }

        res.status(500).json({message: 'Не вдалося оновити аватарку групи'});
    }
};
export const promoteToAdmin = async (req: Request, res: Response) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const currentUserId = req.user?.id;
        const {targetUserId} = req.body;

        if (!currentUserId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }

        if (!chatId || isNaN(chatId) || !targetUserId) {
            return res.status(400).json({message: "Некоректні дані"});
        }

        await chatRepo.promoteToAdmin(chatId, currentUserId, targetUserId);

        res.json({message: "Користувача успішно призначено адміністратором"});

    } catch (error: any) {
        console.error('Помилка в promoteToAdmin:', error);

        if (error.message === "Access denied: only admins can promote members") {
            return res.status(403).json({message: "Тільки адміністратори можуть призначати інших адмінів"});
        }
        if (error.message === "Target user is not a member of this chat") {
            return res.status(404).json({message: "Цей користувач не є учасником групи"});
        }

        res.status(500).json({message: 'Не вдалося призначити адміністратора'});
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