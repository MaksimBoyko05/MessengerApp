import {Request, Response} from "express";
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
        res.status(500).json({error: "Database error"});
    }
};

// ==== Get single user by ID ====
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await UserRepository.findById(Number(req.params.id));
        if (user == null)
            return res.status(404).json({error: "User not found"});
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
};
export const getRecentUsers = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const users = await UserRepository.getRecentOnlineUsers(userId);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching recent online users:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

// ==== Create user (registration-like) ====
interface CreateUserBody {
    username: string;
    email: string;
    password: string;
    avatar_url?: string;
}

export const createUser = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    const {username, email, password, avatar_url} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserRepository.create(username, email, hashedPassword, avatar_url || null);
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
};

//=== Login User ===
interface LoginUserBody {
    email: string;
    password: string;
}

export const login = async (req: Request<{}, {}, LoginUserBody>, res: Response) => {
    const {email, password} = req.body;
    try {
        const user = await UserRepository.findByEmail(email);
        if (!user)
            return res.status(401).json({error: "User not found"});
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid)
            return res.status(401).json({error: "Invalid email or password"});
        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET as string, {expiresIn: "1h"});
        res.json({message: "Login successful", token});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
}
export const getMe = async (req: Request, res: Response) => {
    const user = await UserRepository.findById(Number(req.user.id));
    if (!user)
        return res.status(401).json({error: "User not found"});
    const {password_hash, ...userData} = user;
    res.json(userData);

}
/// ==== Update user ====
export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const {username, email, password} = req.body;

        const currentUserId = (req as any).user?.id;
        if (currentUserId !== userId) {
            return res.status(403).json({error: "Access denied: you can only update your own profile"});
        }

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        

        if (req.file) {
            updateData.avatar_url = `/avatars/${req.file.filename}`;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({error: "No fields to update"});
        }

        const updatedUser = await UserRepository.update(userId, updateData);

        if (!updatedUser) {
            return res.status(404).json({error: "User not found"});
        }

        res.json(updatedUser);
    } catch (err) {
        console.error("Error in updateUser:", err);
        res.status(500).json({error: "Database error"});
    }
};
// ==== Change Password ====
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const {oldPassword, newPassword} = req.body;

        const currentUserId = (req as any).user?.id;
        if (currentUserId !== userId) {
            return res.status(403).json({error: "Access denied: you can only update your own password"});
        }

        if (!oldPassword || !newPassword) {
            return res.status(400).json({error: "Old and new passwords are required"});
        }

        const userResult = await pool.query(
            "SELECT password_hash FROM users WHERE id = $1",
            [userId]
        );

        const user = userResult.rows[0];
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({error: "Invalid current password"});
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
        if (isSamePassword) {
            return res.status(400).json({error: "New password must be different from the old one"});
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await UserRepository.update(userId, {password_hash: hashedNewPassword});

        res.json({message: "Password updated successfully"});
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({error: "Server error"});
    }
};
//=== Search user for create Chat===
export const searchUsers = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const {q} = req.query;

        if (!userId || typeof q !== 'string' || q.trim() === '') {
            return res.json([]);
        }

        const users = await UserRepository.search(q, userId);
        res.json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({message: 'Помилка пошуку'});
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
            return res.status(404).json({error: "User not found"});
        res.json({message: "User deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
};
