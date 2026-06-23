"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const chatController_1 = require("../controllers/chatController");

const router = express_1.default.Router();

router.get('/', authMiddleware_1.protect, chatController_1.getChats);
router.post('/request', authMiddleware_1.protect, chatController_1.sendRequest);
router.post('/:id/accept', authMiddleware_1.protect, chatController_1.acceptRequest);
router.post('/:id/decline', authMiddleware_1.protect, chatController_1.declineRequest);
router.post('/:id/message', authMiddleware_1.protect, chatController_1.sendMessage);

exports.default = router;
