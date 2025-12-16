import express from "express";
import pool from "../db.js";
import {login, createUser} from "../controllers/userController.js";
import {getMe} from "../controllers/userController.js"
import {protect} from "../middleware/authMiddleware.js";
const router = express.Router();

// ==================== REGISTER ====================
router.post("/register", createUser);

// ==================== LOGIN ====================
router.post("/login", login);

// ==================== ME ====================
router.get("/me", protect, getMe);

export default router;
