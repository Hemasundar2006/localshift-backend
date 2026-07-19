"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestAppVersions = exports.uploadAppVersion = void 0;
const AppVersion_1 = require("../models/AppVersion");

const uploadAppVersion = async (req, res) => {
    try {
        const { version, platform, releaseNotes } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an app file (.apk or similar)' });
        }
        
        // Generate a public URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        // If this is set to be the latest, update all others of this platform to false
        await AppVersion_1.AppVersion.updateMany({ platform }, { isLatest: false });
        
        const newVersion = await AppVersion_1.AppVersion.create({
            version,
            platform,
            releaseNotes,
            downloadUrl: fileUrl,
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
