import express from "express";
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from "dotenv";
import cors from "cors";
import {createServer} from "http";
import rateLimit from "express-rate-limit";

export {app, httpServer};

dotenv.config({path: ".env"});

import {initSocket} from "./socket.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from './routes/chatsRoutes.js';
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import "./cron.js";
import "./workers/emailWorker.js";

const app = express();

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json());

const httpServer = createServer(app);
initSocket(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: "Занадто багато запитів з вашої IP-адреси. Спробуйте пізніше.",
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Занадто багато спроб авторизації. Спробуйте пізніше.",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}