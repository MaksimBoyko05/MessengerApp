import { Request, Response } from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import redis from "../redisClient.js"
import jwt from 'jsonwebtoken';
import {UserRepository} from "../repositories/UserRepository.js";

// ==== Get all users ====
export const getUsers = async (req: Request, res: Response) => {
  try {
    const cached = await redis.get("users");
    if (cached) {
      console.log("🧠 Cache hit");
      return res.json(JSON.parse(cached));
    }

    const users = await UserRepository.findAll();

    // кеш на 60 секунд
    await redis.set("users", JSON.stringify(users), "EX", 60);
    console.log("💾 Cache saved");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Get single user by ID ====
export const getUserById = async (req: Request, res: Response) => {
  try {
   const user = await UserRepository.findById(Number(req.params.id));
    if (user == null)
      return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ==== Create user (registration-like) ====
interface CreateUserBody {
  username: string;
  email: string;
  password: string;
  avatar_url?:string;
}
export const createUser = async (req: Request <{}, {}, CreateUserBody>, res: Response) => {
  const { username, email, password, avatar_url } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserRepository.create(username, email, hashedPassword, avatar_url || null);
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
//=== Login User ===
interface LoginUserBody {
  email: string;
  password: string;
}
export const login = async (req: Request<{}, {}, LoginUserBody>, res: Response) => {
  const { email, password } = req.body;
  try{
    const user = await UserRepository.findByEmail(email);
    if(!user)
      return res.status(401).json({ error: "User not found" });
    const isValid = await bcrypt.compare(password, user.password_hash);
    if(!isValid)
      return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET  as string, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
export const getMe = async (req: Request, res: Response) => {
  const user = await UserRepository.findById(Number(req.user.id));
  if (!user)
    return res.status(401).json({ error: "User not found" });
  const { password_hash, ...userData } = user;
  res.json(userData);

}
// ==== Update user ====
export const updateUser = async (req: Request, res: Response) => {
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
export const deleteUser = async (req: Request, res: Response) => {
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
