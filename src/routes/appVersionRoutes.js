"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appVersionController_1 = require("../controllers/appVersionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");

const router = express_1.default.Router();

// Public: get latest versions (used by app to check for updates)
router.get('/latest', appVersionController_1.getLatestAppVersions);

// Protected: get full version history
router.get('/all', authMiddleware_1.protect, appVersionController_1.getAllAppVersions);

// Protected: step 1 – browser requests a Cloudinary signed upload token
router.get('/get-signature', authMiddleware_1.protect, appVersionController_1.getUploadSignature);

// Protected: step 2 – browser sends Cloudinary URL after direct upload
router.post('/save', authMiddleware_1.protect, appVersionController_1.saveAppVersion);

exports.default = router;
