"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppVersions = exports.getLatestAppVersions = exports.saveAppVersion = exports.getUploadSignature = void 0;
const AppVersion_1 = require("../models/AppVersion");
const cloudinary_1 = require("cloudinary");

// ─── GET /api/app-versions/get-signature ──────────────────────────────────────
// Returns a signed upload preset so the browser can upload DIRECTLY to Cloudinary.
// File never passes through our server → no timeout issues.
const getUploadSignature = async (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = 'localshift-apks';

        // NOTE: resource_type is part of the URL path (/raw/upload), NOT a signed param.
        // Only sign the params that go into the FormData body.
        const signature = cloudinary_1.v2.utils.api_sign_request(
            { timestamp, folder },
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        });
    } catch (error) {
        console.error('getUploadSignature error:', error);
        res.status(500).json({ message: 'Could not generate upload signature', error: error.message });
    }
};
exports.getUploadSignature = getUploadSignature;

// ─── POST /api/app-versions/save ──────────────────────────────────────────────
// After the browser uploads directly to Cloudinary, it calls this endpoint
// with just the Cloudinary URL + version metadata. Fast — no file transfer.
const saveAppVersion = async (req, res) => {
    try {
        const { version, platform, releaseNotes, downloadUrl } = req.body;

        if (!version || !platform || !downloadUrl) {
            return res.status(400).json({ message: 'version, platform, and downloadUrl are required' });
        }

        // Mark all existing versions of this platform as not-latest
        await AppVersion_1.AppVersion.updateMany({ platform }, { isLatest: false });

        const newVersion = await AppVersion_1.AppVersion.create({
            version,
            platform,
            releaseNotes,
            downloadUrl,
            isLatest: true,
            uploadedBy: req.user._id
        });

        res.status(201).json(newVersion);
    } catch (error) {
        console.error('saveAppVersion error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.saveAppVersion = saveAppVersion;

// ─── GET /api/app-versions/latest ─────────────────────────────────────────────
const getLatestAppVersions = async (req, res) => {
    try {
        const versions = await AppVersion_1.AppVersion.find({ isLatest: true });
        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getLatestAppVersions = getLatestAppVersions;

// ─── GET /api/app-versions/all ────────────────────────────────────────────────
const getAllAppVersions = async (req, res) => {
    try {
        const versions = await AppVersion_1.AppVersion.find({}).sort({ createdAt: -1 });
        res.json(versions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAllAppVersions = getAllAppVersions;
