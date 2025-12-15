import express from "express";
import pool from "../db.ts";
import {login, createUser} from "../controllers/userController.ts";
import {getMe} from "../controllers/userController.ts";
import {protect} from "../middleware/authMiddleware.ts";
const router = express.Router();

// ==================== REGISTER ====================
router.post("/register", createUser);

// ==================== LOGIN ====================
router.post("/login", login);

// ==================== ME ====================
router.get("/me", protect, getMe);

export default router;
