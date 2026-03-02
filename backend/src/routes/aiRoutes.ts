import {Router} from 'express';
import {generateSmartReplies, trackSuggestionUsage, askAiInChat} from "../controllers/AIController.js";
import {protect} from '../middleware/authMiddleware.js';
import router from "./chatsRoutes.js";


router.post('/smart-reply', protect, generateSmartReplies);
router.post("/analytics", protect, trackSuggestionUsage);
router.post("/ask", protect, askAiInChat);
export default router;