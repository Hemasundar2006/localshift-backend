"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppVersions = exports.getLatestAppVersions = exports.uploadAppVersion = void 0;
const AppVersion_1 = require("../models/AppVersion");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");

const uploadAppVersion = async (req, res) => {
    try {
        const { version, platform, releaseNotes } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an app file (.apk, .aab, or .ipa)' });
        }

        if (!version || !platform) {
            return res.status(400).json({ message: 'version and platform are required fields' });
        }

        // Upload to Cloudinary (file is in memory buffer via memoryStorage)
        let fileUrl;
        try {
            fileUrl = await uploadMiddleware_1.uploadToCloudinary(req.file.buffer, req.file.originalname);
        } catch (cloudErr) {
            console.error('Cloudinary upload error:', cloudErr);
            return res.status(500).json({ message: 'Failed to upload file to cloud storage', error: cloudErr.message });
        }

        // Mark all existing versions of this platform as not-latest
        await AppVersion_1.AppVersion.updateMany({ platform }, { isLatest: false });

        const newVersion = await AppVersion_1.AppVersion.create({
            version,
            platform,
            releaseNotes,
            downloadUrl: fileUrl,   // Cloudinary URL (permanent, CDN-backed)
            isLatest: true,
            uploadedBy: req.user._id
        });

        res.status(201).json(newVersion);
    } catch (error) {
        console.error('uploadAppVersion error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.uploadAppVersion = uploadAppVersion;

const getLatestAppVersions = async (req, res) => {
    try {
        const versions = await AppVersion_1.AppVersion.find({ isLatest: true });
        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getLatestAppVersions = getLatestAppVersions;

const getAllAppVersions = async (req, res) => {
    try {
        const versions = await AppVersion_1.AppVersion.find({}).sort({ createdAt: -1 });
        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllAppVersions = getAllAppVersions;
