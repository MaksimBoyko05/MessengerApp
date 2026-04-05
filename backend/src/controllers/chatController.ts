import {Request, Response} from 'express';
import {ChatRepository} from '../repositories/ChatRepository.js';
import {MessageRepository} from '../repositories/MessageRepository.js';
import {getIO} from '../socket.js';

const chatRepo = new ChatRepository();
const messageRepo = new MessageRepository();

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
            return res.status(400).json({message: "Назва групи та список учасників обов'язкові"});
        }

        if (memberIds.length === 0) {
            return res.status(400).json({message: "Група повинна мати хоча б одного учасника крім вас"});
        }

        const newChat = await chatRepo.createGroupChat(creatorId, name, memberIds);

        const [creatorName] = await chatRepo.getUsernames([creatorId]);
        const text = `Групу створено користувачем: ${creatorName || 'Адміністратор'}`;
        const systemMessage = await messageRepo.createSystemMessage(newChat.id, creatorId, text);

        const fullChatData = await chatRepo.getChatByIdForSidebar(newChat.id, creatorId);

        const io = getIO();

        io.to(`chat_${newChat.id}`).emit("receive_message", systemMessage);

        const allMembers = [...memberIds, creatorId];

        allMembers.forEach(memberId => {
            io.to(`user_${memberId}`).emit("new_chat_created", fullChatData);
        });

        res.status(201).json({
            message: "Групу успішно створено",
            chat: fullChatData
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
        const addedIds = await chatRepo.addMembersToGroupChat(chatId, currentUserId, memberIds);
        if (addedIds.length > 0) {
            const addedUsernames = await chatRepo.getUsernames(addedIds);
            const text = `Додано до групи: ${addedUsernames.join(', ')}`;
            const systemMessage = await messageRepo.createSystemMessage(chatId, currentUserId, text);
            const io = getIO();
            io.to(`chat_${chatId}`).emit("receive_message", systemMessage);

            io.to(`chat_${chatId}`).emit("group_updated", {
                action: "add_members",
                chatId: chatId,
                addedIds: addedIds
            });
        }

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
export const removeMember = async (req: Request, res: Response) => {
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

        const [targetUsername] = await chatRepo.getUsernames([targetUserId]);

        await chatRepo.removeMemberFromGroup(chatId, currentUserId, targetUserId);

        const text = `Видалено: ${targetUsername || 'Користувача'}`;
        const systemMessage = await messageRepo.createSystemMessage(chatId, currentUserId, text);

        const io = getIO();
        io.to(`chat_${chatId}`).emit("receive_message", systemMessage);

        io.to(`chat_${chatId}`).emit("group_updated", {
            action: "remove_member",
            chatId: chatId,
            userId: targetUserId
        });

        res.json({message: "Учасника успішно видалено"});

    } catch (error: any) {
        console.error('Помилка в removeMember:', error);
        if (error.message === "Access denied: only admins can remove members") {
            return res.status(403).json({message: "Тільки адміністратори можуть видаляти учасників"});
        }
        if (error.message === "Target user is not a member of this chat") {
            return res.status(404).json({message: "Користувач не є учасником групи"});
        }
        res.status(500).json({message: 'Не вдалося видалити учасника'});
    }
};
export const leaveGroup = async (req: Request, res: Response) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const currentUserId = req.user?.id;

        if (!currentUserId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }
        if (!chatId || isNaN(chatId)) {
            return res.status(400).json({message: "Некоректний ID чату"});
        }

        const [username] = await chatRepo.getUsernames([currentUserId]);

        await chatRepo.leaveGroupChat(chatId, currentUserId);

        const text = `${username || 'Користувач'} покинув(ла) групу`;
        const systemMessage = await messageRepo.createSystemMessage(chatId, currentUserId, text);

        const io = getIO();
        io.to(`chat_${chatId}`).emit("receive_message", systemMessage);

        io.to(`chat_${chatId}`).emit("group_updated", {
            action: "remove_member",
            chatId: chatId,
            userId: currentUserId
        });

        res.json({message: "Ви успішно покинули групу"});

        res.json({message: "Ви успішно покинули групу"});

    } catch (error: any) {
        console.error('Помилка в leaveGroup:', error);
        if (error.message === "You are not a member of this chat") {
            return res.status(404).json({message: "Ви не є учасником цієї групи"});
        }
        res.status(500).json({message: 'Не вдалося покинути групу'});
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

        const io = getIO();
        io.to(`chat_${chatId}`).emit("group_updated", {
            action: "update_avatar",
            chatId: chatId,
            newAvatarUrl: avatarUrl
        });

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
export const updateGroupName = async (req: Request, res: Response) => {
    try {
        const chatId = parseInt(req.params.chatId);
        const currentUserId = req.user?.id;
        const {newName} = req.body;

        if (!currentUserId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }
        if (!chatId || isNaN(chatId) || !newName) {
            return res.status(400).json({message: "Некоректні дані"});
        }

        await chatRepo.updateGroupName(chatId, currentUserId, newName);

        const text = `Змінено назву групи на: "${newName}"`;
        const systemMessage = await messageRepo.createSystemMessage(chatId, currentUserId, text);

        const io = getIO();
        io.to(`chat_${chatId}`).emit("receive_message", systemMessage);

        io.to(`chat_${chatId}`).emit("group_updated", {
            action: "update_name",
            chatId: chatId,
            newName: newName
        });

        res.json({message: "Назву групи успішно оновлено", newName});

    } catch (error: any) {
        console.error('Помилка в updateGroupName:', error);
        if (error.message === "Access denied: only admins can change name") {
            return res.status(403).json({message: "Тільки адміністратори можуть змінювати назву"});
        }
        res.status(500).json({message: 'Не вдалося змінити назву групи'});
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
        const io = getIO();

        io.to(`chat_${chatId}`).emit("group_updated", {
            action: "promote_admin",
            chatId: chatId,
            userId: targetUserId
        });


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
export const promoteToMember = async (req: Request, res: Response) => {
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
        const io = getIO();

        io.to(`chat_${chatId}`).emit("group_updated", {
            action: "promote_member",
            chatId: chatId,
            userId: targetUserId
        });


        res.json({message: "З користувача знято адмін прва"});

    } catch (error: any) {
        console.error('Помилка в promoteToMember:', error);

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