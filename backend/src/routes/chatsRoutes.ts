import {Router} from 'express';
import {
    getMyChats,
    getChatDetails,
    createOrOpenChat,
    deleteChat,
    createGroupChat,
    addMembersToGroup,
    updateGroupAvatar,
    promoteToAdmin
} from '../controllers/chatController.js';
import {protect} from '../middleware/authMiddleware.js';
import {upload} from "../middleware/upload.js";

const router = Router();

// GET /api/chats
router.get('/', protect, getMyChats);
router.get('/:chatId', protect, getChatDetails);

//POST /api/chats
router.post('/', protect, createOrOpenChat);
router.post('/groups', protect, createGroupChat);
router.post('/:chatId/members', protect, addMembersToGroup);

//PATCH /api/chats
router.patch('/:chatId/members/promote', protect, promoteToAdmin);

//PUT /api/chats
router.put('/:chatId/avatar', protect, upload.single('avatar'), updateGroupAvatar);

// DELETE /api/chats/:chatId
router.delete('/:chatId', protect, deleteChat);
export default router;