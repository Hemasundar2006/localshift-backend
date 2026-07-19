"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post('/register', authController_1.registerUser);
router.post('/verify-otp', authController_1.verifyOTP);
router.post('/login', authController_1.loginUser);
router.post('/google', authController_1.googleLogin);
router.post('/reset-password', authController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map