import {Server as HttpServer} from "http";
import {Server, Socket} from "socket.io";
import {ChatRepository} from "./repositories/ChatRepository.js";

let io: Server;
const chatRepo = new ChatRepository();
export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", async (socket: Socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            console.log(`Користувач ${userId} підключився`);

            try {
                const userChats = await chatRepo.getUserChats(Number(userId));
                userChats.forEach(chat => {
                    const roomName = `chat_${chat.id}`;
                    socket.join(roomName);
                });

                console.log(`Юзер ${userId} приєднаний до ${userChats.length} кімнат`);
            } catch (err) {
                console.error("Помилка автоматичного join:", err);
            }
        }
        socket.on("join_chat", (chatId: string | number) => {
            const roomName = `chat_${chatId}`;
            socket.join(roomName);
            console.log(` User ${socket.id} joined room: ${roomName}`);
        });

        socket.on("leave_chat", (chatId: string | number) => {
            const roomName = `chat_${chatId}`;
            socket.leave(roomName);
            console.log(`User left room: ${roomName}`);
        });

        socket.on("disconnect", () => {
            console.log(" User disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};