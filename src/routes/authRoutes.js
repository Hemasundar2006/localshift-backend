"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();

const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    validate: { xForwardedForHeader: false },
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const verifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    validate: { xForwardedForHeader: false },
    message: { message: 'Too many verify attempts from this IP, please try again after 15 minutes' }
});

router.post('/register', authLimiter, authController_1.registerUser);
router.post('/verify-otp', verifyLimiter, authController_1.verifyOTP);
router.post('/login', authLimiter, authController_1.loginUser);
router.post('/google', authLimiter, authController_1.googleLogin);
router.post('/reset-password', authLimiter, authController_1.resetPassword);

exports.default = router;
//# sourceMappingURL=authRoutes.js.map