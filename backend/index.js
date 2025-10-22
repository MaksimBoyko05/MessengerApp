import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";
import { emailQueue } from "./queues/emailQueue.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import rateLimit from "express-rate-limit";
import "./queues/emailQueue.js";
import "./cron.js";


dotenv.config({ path: ".env" });
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");


const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: "Занадто багато запитів з вашої IP-адреси. Спробуйте пізніше.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

app.get("/test-email", async (req, res) => {
  await emailQueue.add("sendTestEmail", {
    email: "vvangog52@gmail.com",
    subject: "Тестова розсилка від месенджера",
    text: "Це тест перевірки BullMQ 🚀",
  });
  res.send("📬 Задача надіслана у чергу");
});

app.use("/auth", authRoutes);

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
