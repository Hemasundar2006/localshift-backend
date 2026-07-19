"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const earnController_1 = require("../controllers/earnController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();

router.post('/ad', authMiddleware_1.protect, earnController_1.earnFromAd);
router.get('/lottery/tickets', authMiddleware_1.protect, earnController_1.getTickets);
router.post('/lottery/draw', earnController_1.triggerWeeklyDraw);
router.post('/task', authMiddleware_1.protect, earnController_1.earnFromTask);
router.post('/withdraw', authMiddleware_1.protect, earnController_1.withdrawCoins);
router.get('/transactions', authMiddleware_1.protect, earnController_1.getTransactions);
router.get('/stats', authMiddleware_1.protect, earnController_1.getStats);

exports.default = router;
