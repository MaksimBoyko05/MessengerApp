import {Router} from 'express';
import {getMyChats, getChatDetails} from '../controllers/chatController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/chats
router.get('/', protect, getMyChats);
router.get('/:chatId', protect, getChatDetails);

export default router;