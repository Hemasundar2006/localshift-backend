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

// Public: latest versions (used by app to check for updates)
router.get('/latest', appVersionController_1.getLatestAppVersions);

// Protected: version history
router.get('/all', authMiddleware_1.protect, appVersionController_1.getAllAppVersions);

// Protected: upload APK → server buffers it → uploads to GitHub Releases
// Uses memoryStorage (no disk), 200MB limit for large APKs
router.post('/upload', authMiddleware_1.protect, uploadMiddleware_1.uploadAppFile.single('appFile'), appVersionController_1.uploadAppVersion);

exports.default = router;
