import express from "express";
import pool from "../db.js";
import {login, createUser, forgotPassword, resetPassword, verifyResetToken} from "../controllers/userController.js";
import {getMe} from "../controllers/userController.js"
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();


// /api/

// ==================== REGISTER ====================
router.post("/register", createUser);

// ==================== LOGIN ====================
router.post("/login", login);

// ====================Forgot Pass ====================
router.post("/forgot-password", forgotPassword);

// ==================== Reset Pass ====================
router.post("/reset-password", resetPassword);

// ==================== ME ====================
router.get("/me", protect, getMe);

// ==================== Verify Token ====================
router.get("/reset-password/:token", verifyResetToken);

export default router;
