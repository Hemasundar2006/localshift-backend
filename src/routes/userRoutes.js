"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = express_1.default.Router();
router.get('/profile', authMiddleware_1.protect, userController_1.getUserProfile);
router.put('/profile', authMiddleware_1.protect, userController_1.updateUserProfile);
router.post('/change-password', authMiddleware_1.protect, userController_1.changePassword);
router.post('/resume', authMiddleware_1.protect, uploadMiddleware_1.upload.single('resume'), userController_1.uploadResume);
router.post('/avatar', authMiddleware_1.protect, uploadMiddleware_1.upload.single('avatar'), userController_1.uploadAvatar);
router.put('/push-token', authMiddleware_1.protect, userController_1.updatePushToken);
router.put('/push-preferences', authMiddleware_1.protect, userController_1.updatePushPreferences);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map