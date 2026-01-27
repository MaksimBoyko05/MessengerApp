import {Server as HttpServer} from "http";
import {Server, Socket} from "socket.io";
import {ChatRepository} from "./repositories/ChatRepository.js";
import {MessageRepository} from "./repositories/MessageRepository.js";
import pool from "./db.js"

let io: Server;
const chatRepo = new ChatRepository();
const messageRepo = new MessageRepository();
export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", async (socket: Socket) => {
        const userId = socket.handshake.query.userId;
        await pool.query(`
            INSERT INTO user_statuses (user_id, online, last_seen)
            VALUES ($1, true, NOW()) ON CONFLICT (user_id) 
    DO
            UPDATE SET online = true, last_seen = NOW()
        `, [userId]);
        console.log(`📢 SERVER: Відправляю broadcast про User ${userId} (Online)`);
        socket.broadcast.emit("user_status_change", {
            userId: Number(userId),
            online: true,
        });

        if (userId) {
            console.log(`Користувач ${userId} підключився`);

            socket.join(`user_${userId}`);

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
        socket.on("mark_messages_read", async ({chatId, userId}) => {
            try {
                await messageRepo.markAsRead(Number(chatId), Number(userId));
                const roomName = `chat_${chatId}`;
                socket.to(roomName).emit("message_read", {
                    chat_id: chatId,
                    user_id: userId
                });

                console.log(`User ${userId} read messages in chat ${chatId}`);

            } catch (err) {
                console.error("Error marking messages read:", err);
            }
        });
        socket.on("leave_chat", (chatId: string | number) => {
            const roomName = `chat_${chatId}`;
            socket.leave(roomName);
            console.log(`User left room: ${roomName}`);
        });

        socket.on("disconnect", async () => {
            console.log(" User disconnected:", socket.id);
            await pool.query(
                "UPDATE user_statuses SET online = false, last_seen = NOW() WHERE user_id = $1",
                [userId]
            );
            socket.broadcast.emit("user_status_change", {
                userId: Number(userId),
                online: false,
                lastSeen: new Date(),
            });
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