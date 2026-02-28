import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {upload} from "../middleware/upload.js";
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers,
    getRecentUsers,
    changePassword,
    requestEmailChange,
    verifyEmailChange
} from "../controllers/userController.js";

const router = express.Router();

// GET /api/users
router.get("/", protect, getUsers);
router.get('/search', protect, searchUsers);
router.get('/recent', protect, getRecentUsers);
router.get("/:id", protect, getUserById);

//POST /api/users
router.post("/:id/request-email-change", protect, requestEmailChange);
router.post("/verify-email", verifyEmailChange);

// PUT /api/users
router.put("/:id/password", protect, changePassword);
router.put("/:id", protect, upload.single("avatar"), updateUser);

// DELETE /api/users
router.delete("/:id", protect, deleteUser);
export default router;
