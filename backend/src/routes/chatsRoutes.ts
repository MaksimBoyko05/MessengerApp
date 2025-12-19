import { Router } from 'express';
import { getMyChats } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/chats
router.get('/', protect, getMyChats);

export default router;