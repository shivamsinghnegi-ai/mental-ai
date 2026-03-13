const express = require('express');
const { sendMessage, getChatHistory, getChatSessions } = require('../controllers/chat.controller');
const verifyToken = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST   /api/chat/message   → verifyToken, chatRateLimiter, sendMessage
router.post('/message', verifyToken, chatLimiter, sendMessage);

// GET    /api/chat/history   → verifyToken, getChatHistory
router.get('/history', verifyToken, getChatHistory);

// GET    /api/chat/sessions  → verifyToken, getChatSessions
router.get('/sessions', verifyToken, getChatSessions);

module.exports = router;
