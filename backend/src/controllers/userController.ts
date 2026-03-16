import {Request, Response} from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import * as crypto from "node:crypto";
import redis from "../redisClient.js"
import jwt from 'jsonwebtoken';
import {UserRepository} from "../repositories/UserRepository.js";
import {TokenRepository} from "../repositories/TokenRepository.js";
import {emailQueue} from "../queues/emailQueue.js";

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
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }

        const users = await UserRepository.getRecentOnlineUsers(userId);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching recent users with messages:", error);
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
export const toggleSearchPrivacy = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const {isPrivate} = req.body;

        if (!userId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }

        if (typeof isPrivate !== 'boolean') {
            return res.status(400).json({message: "Очікується булеве значення isPrivate"});
        }

        await UserRepository.updatePrivacySetting(userId, isPrivate);

        res.json({
            message: "Налаштування приватності успішно оновлено",
            isPrivate
        });
    } catch (error) {
        console.error("Помилка оновлення приватності:", error);
        res.status(500).json({message: "Помилка сервера"});
    }
};
// ==== Update User Theme ====
export const updateTheme = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const {theme} = req.body;

        if (!userId) {
            return res.status(401).json({message: "Неавторизований користувач"});
        }

        if (typeof theme !== 'string' || theme.trim() === '') {
            return res.status(400).json({message: "Очікується рядкове значення theme (наприклад, 'light' або 'dark')"});
        }

        await UserRepository.updateThemeSetting(userId, theme);

        res.json({
            message: "Тему успішно оновлено",
            theme
        });
    } catch (error) {
        console.error("Помилка оновлення теми:", error);
        res.status(500).json({message: "Помилка сервера"});
    }
};
//==== Email Change Request (token) ====
export const requestEmailChange = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const {newEmail} = req.body;

        const currentUserId = (req as any).user?.id;
        if (currentUserId !== userId) {
            return res.status(403).json({error: "Access denied"});
        }

        if (!newEmail) {
            return res.status(400).json({error: "New email is required"});
        }

        const existingUser = await UserRepository.findByEmail(newEmail);
        if (existingUser) {
            return res.status(400).json({error: "This email is already in use"});
        }

        await TokenRepository.deleteUserTokensByType(userId, 'EMAIL_UPDATE');

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await TokenRepository.createToken(userId, token, 'EMAIL_UPDATE', newEmail, expiresAt);

        const confirmLink = `http://localhost:5173/verify-email?token=${token}`;
        await emailQueue.add("sendEmail", {
            email: newEmail,
            subject: "Підтвердження нової електронної пошти",
            text: `Перейдіть за посиланням: ${confirmLink} \nДійсне 1 годину.`
        });

        res.json({message: "Лист надіслано"});
    } catch (err) {
        console.error("Error requesting email change:", err);
        res.status(500).json({error: "Server error"});
    }
};
//=== Email Change Verification ====
export const verifyEmailChange = async (req: Request, res: Response) => {
    try {
        const {token} = req.body;
        if (!token) return res.status(400).json({error: "Token is required"});
        const validToken = await TokenRepository.findValidToken(token, 'EMAIL_UPDATE');
        if (!validToken) {
            return res.status(400).json({error: "Invalid or expired token"});
        }

        const {user_id, payload: newEmail} = validToken;

        await UserRepository.updateEmailAndClearTokens(user_id, newEmail, 'EMAIL_UPDATE');

        res.json({message: "Email successfully updated"});
    } catch (err) {
        console.error("Error verifying email:", err);
        res.status(500).json({error: "Server error"});
    }
};
//==== Password Reset Request (Forgot Password) ====
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const {email} = req.body;

        if (!email) {
            return res.status(400).json({error: "Email is required"});
        }

        const user = await UserRepository.findByEmail(email);

        if (!user) {
            return res.json({message: "Якщо акаунт з таким email існує, ми надіслали інструкції з відновлення пароля."});
        }

        await TokenRepository.deleteUserTokensByType(user.id, 'PASSWORD_RESET');

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await TokenRepository.createToken(user.id, token, 'PASSWORD_RESET', '', expiresAt);

        const resetLink = `http://localhost:5173/reset-password?token=${token}`;

        await emailQueue.add("sendEmail", {
            email: user.email,
            subject: "Відновлення пароля",
            text: `Ви подали запит на скидання пароля.\nПерейдіть за посиланням, щоб встановити новий пароль: ${resetLink} \nПосилання дійсне 15 хвилин.`
        });

        res.json({message: "Якщо акаунт з таким email існує, ми надіслали інструкції з відновлення пароля."});
    } catch (err) {
        console.error("Error in forgotPassword:", err);
        res.status(500).json({error: "Server error"});
    }
};
//==== Password Reset Verification & Update ====
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const {token, newPassword} = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({error: "Token and new password are required"});
        }

        const validToken = await TokenRepository.findValidToken(token, 'PASSWORD_RESET');

        if (!validToken) {
            return res.status(400).json({error: "Invalid or expired token"});
        }

        const userId = validToken.user_id;

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        await UserRepository.update(userId, {password_hash: hashedNewPassword});

        await TokenRepository.deleteUserTokensByType(userId, 'PASSWORD_RESET');

        res.json({message: "Password has been successfully reset"});
    } catch (err) {
        console.error("Error in resetPassword:", err);
        res.status(500).json({error: "Server error"});
    }
};
//==== Check Password Reset Token Validity ====
export const verifyResetToken = async (req: Request, res: Response) => {
    try {
        const {token} = req.params;

        if (!token) {
            return res.status(400).json({error: "Token is required"});
        }

        const validToken = await TokenRepository.findValidToken(token, 'PASSWORD_RESET');

        if (!validToken) {
            return res.status(400).json({error: "Invalid or expired token"});
        }
        res.status(200).json({valid: true});
    } catch (err) {
        console.error("Error in verifyResetToken:", err);
        res.status(500).json({error: "Server error"});
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
