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

// Public route to get the latest app versions for download
router.get('/latest', appVersionController_1.getLatestAppVersions);

// Protected route to get all app versions (history)
router.get('/all', authMiddleware_1.protect, appVersionController_1.getAllAppVersions);

// Protected route to upload a new app version → file goes to Cloudinary via memoryStorage
router.post('/upload', authMiddleware_1.protect, uploadMiddleware_1.uploadAppFile.single('appFile'), appVersionController_1.uploadAppVersion);

exports.default = router;
