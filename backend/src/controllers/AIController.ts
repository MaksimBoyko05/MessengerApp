import {Request, Response} from 'express';
import {GoogleGenerativeAI} from "@google/generative-ai";
import {MessageRepository} from "../repositories/MessageRepository.js";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY is not set in .env");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});
const messageRepo = new MessageRepository();

export const generateSmartReplies = async (req: Request, res: Response) => {
    try {
        const {chatId, messageId} = req.body;
        const userId = (req as any).user?.id;

        if (!chatId || !messageId) {
            return res.status(400).json({message: "Chat ID and Message ID are required"});
        }

        const allMessages = await messageRepo.findByChat(chatId, userId);

        const contextMessages = allMessages.slice(-15);

        const targetMessage = allMessages.find(m => m.id === Number(messageId));

        if (!targetMessage) {
            return res.status(404).json({message: "Message not found or access denied"});
        }

        const historyText = contextMessages.map(msg => {
            const role = msg.user_id === userId ? "Я (Користувач)" : "Співрозмовник";
            const cleanText = (msg.text ?? "").replace(/\n/g, " ");
            return `${role}: ${cleanText}`;
        }).join("\n");

        const prompt = `
            Ти - розумний асистент у месенджері. Твоє завдання - допомогти користувачу "Я" швидко відповісти.

            Ось історія нашого діалогу:
            ---
            ${historyText}
            ---

            Співрозмовник написав останнє повідомлення: "${targetMessage.text}"
            
            Згенеруй 3 варіанти короткої, влучної відповіді українською мовою для користувача "Я".
            
            Вимоги:
            1. Відповіді мають бути живими, природніми (як у чаті з другом).
            2. Різні за змістом (наприклад: згода, ввічлива відмова, уточнення або жарт, якщо доречно).
            3. Максимум 5-6 слів.
            4. Формат відповіді: ТІЛЬКИ текст варіантів, розділених символом "||". Без нумерації.
            
            Приклад відповіді:
            Звісно, давай!||Вибач, не вийде||А коли саме?
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const suggestions = text
            .split('||')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .slice(0, 3);

        res.json({suggestions});

    } catch (error) {
        console.error("Smart Reply Error:", error);
        res.status(500).json({message: "Не вдалося згенерувати підказки"});
    }
};