import pool from "../db.js";
import bcrypt from "bcryptjs";
import redis from "../redisClient.js";

// ==== Get all users ====
export const getUsers = async (req, res) => {
  try {
    const cached = await redis.get("users");
    if (cached) {
      console.log("🧠 Cache hit");
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      "SELECT id, username, email, avatar_url, created_at FROM users ORDER BY created_at DESC"
    );

    // кеш на 60 секунд
    await redis.set("users", JSON.stringify(result.rows), "EX", 60);
    console.log("💾 Cache saved");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Get single user by ID ====
export const getUserById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, avatar_url, created_at FROM users WHERE id=$1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Create user (registration-like) ====
export const createUser = async (req, res) => {
  const { username, email, password, avatar_url } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar_url, created_at",
      [username, email, hashedPassword, avatar_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Update user ====
export const updateUser = async (req, res) => {
  const { username, email, password, avatar_url } = req.body;
  try {
    const fields = [];
    const values = [];
    let query = "UPDATE users SET ";

    if (username) {
      fields.push("username");
      values.push(username);
    }
    if (email) {
      fields.push("email");
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password_hash");
      values.push(hashedPassword);
    }
    if (avatar_url) {
      fields.push("avatar_url");
      values.push(avatar_url);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const setQuery = fields
      .map((field, i) => `${field}=$${i + 1}`)
      .join(", ");
    query += setQuery + " WHERE id=$" + (fields.length + 1) + " RETURNING id, username, email, avatar_url, created_at";

    values.push(req.params.id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Delete user ====
export const deleteUser = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
