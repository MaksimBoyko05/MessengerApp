import express from "express";
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from "dotenv";
import cors from "cors";
import {createServer} from "http";
import session from 'express-session';

dotenv.config({path: ".env"});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? " Loaded" : " Missing");

import {initSocket} from "./socket.js";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";
import {emailQueue} from "./queues/emailQueue.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from './routes/chatsRoutes.js';
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js"
import rateLimit from "express-rate-limit";
import {buildAdmin} from './admin.js';


import "./cron.js";
import "./workers/emailWorker.js";


const app = express();
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5000"],
        credentials: true,
    })
);
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false},
}));

const httpServer = createServer(app);
initSocket(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: "Занадто багато запитів з вашої IP-адреси. Спробуйте пізніше.",
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", limiter);


app.get("/", (req, res) => {
    res.send("Backend is working ");
});
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);

app.get("/test-email", async (req, res) => {
    await emailQueue.add("sendTestEmail", {
        email: "vvangog52@gmail.com",
        subject: "Тестова розсилка від месенджера",
        text: "Це тест перевірки BullMQ ",
    });
    res.send(" Задача надіслана у чергу");
});

app.use("/api/auth", authRoutes);


console.log('⏳ Building AdminJS...');
const {router: adminRouter} = buildAdmin();
console.log('✅ AdminJS ready');
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
