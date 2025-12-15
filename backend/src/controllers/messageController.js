import pool from "../db.ts";

// ==== Get all messages ====
export const getMessages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Get messages by user ====
export const getMessagesByUser = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE user_id=$1 ORDER BY created_at ASC",
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Get messages by chat ====
export const getMessagesByChat = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE chat_id=$1 ORDER BY created_at ASC",
      [req.params.chatId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Send a message ====
export const sendMessage = async (req, res) => {
  const { chat_id, user_id, text } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO messages (chat_id, user_id, text) VALUES ($1, $2, $3) RETURNING *",
      [chat_id, user_id, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Delete a message ====
export const deleteMessage = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM messages WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Message not found" });
    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
