import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log(" User connected:", socket.id);

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