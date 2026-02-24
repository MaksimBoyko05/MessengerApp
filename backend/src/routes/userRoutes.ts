import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers,
    getRecentUsers
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get('/search', protect, searchUsers);

router.get('/recent', protect, getRecentUsers);

router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
export default router;
