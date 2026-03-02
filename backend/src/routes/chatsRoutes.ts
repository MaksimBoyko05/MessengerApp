import {Router} from 'express';
import {
    getMyChats,
    getChatDetails,
    createOrOpenChat,
    deleteChat,
    createGroupChat
} from '../controllers/chatController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/chats
router.get('/', protect, getMyChats);
router.get('/:chatId', protect, getChatDetails);

//POST /api/chats
router.post('/', protect, createOrOpenChat);
router.post('/groups', protect, createGroupChat);

// DELETE /api/chats/:chatId
router.delete('/:chatId', protect, deleteChat);
export default router;