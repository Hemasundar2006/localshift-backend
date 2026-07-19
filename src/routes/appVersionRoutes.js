"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appVersionController_1 = require("../controllers/appVersionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");

const router = express_1.default.Router();

router.get('/latest', appVersionController_1.getLatestAppVersions);
router.get('/all', authMiddleware_1.protect, appVersionController_1.getAllAppVersions);

// Receives chunks from frontend (bypassing Cloudflare 100MB limit)
router.post('/upload-chunk', authMiddleware_1.protect, uploadMiddleware_1.uploadAppFile.single('chunk'), appVersionController_1.uploadAppChunk);

exports.default = router;
