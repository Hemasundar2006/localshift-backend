const express = require('express');
const router = express.Router();
const { handleMessage } = require('../controllers/chatbotController');

// Public route — no auth required for chatbot
router.post('/message', handleMessage);

module.exports = router;
