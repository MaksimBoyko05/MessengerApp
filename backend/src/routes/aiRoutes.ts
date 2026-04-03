import {Router} from 'express';
import {
    generateSmartReplies,
    trackSuggestionUsage,
    trackSuggestionsIgnored,
    askAiInChat
} from "../controllers/AIController.js";
import {protect} from '../middleware/authMiddleware.js';

const router = Router();


router.post('/smart-reply', protect, generateSmartReplies);
router.post("/smart-reply/usage", protect, trackSuggestionUsage);
router.post("/smart-reply/ignore", protect, trackSuggestionsIgnored);
router.post("/ask", protect, askAiInChat);
export default router;