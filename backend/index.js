import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
