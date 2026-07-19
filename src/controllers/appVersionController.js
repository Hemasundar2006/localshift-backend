"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppVersions = exports.getLatestAppVersions = exports.uploadAppVersion = void 0;
const AppVersion_1 = require("../models/AppVersion");
const rest_1 = require("@octokit/rest");

// GitHub config from env
const GITHUB_OWNER = process.env.GITHUB_OWNER;   // e.g. "Hemasundar2006"
const GITHUB_REPO  = process.env.GITHUB_REPO;    // e.g. "localshift-releases"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;   // Personal Access Token (repo scope)

// ─── POST /api/app-versions/upload ────────────────────────────────────────────
// Receives the APK via multipart, creates a GitHub Release, uploads the APK
// as a release asset, saves the resulting download URL to MongoDB.
const uploadAppVersion = async (req, res) => {
    try {
        const { version, platform, releaseNotes } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an app file (.apk, .aab, or .ipa)' });
        }
        if (!version || !platform) {
            return res.status(400).json({ message: 'version and platform are required' });
        }

        const octokit = new rest_1.Octokit({ auth: GITHUB_TOKEN });
        const tagName = `v${version}-${platform}-${Date.now()}`;

        // 1. Create a GitHub Release
        const { data: release } = await octokit.rest.repos.createRelease({
            owner: GITHUB_OWNER,
            repo:  GITHUB_REPO,
            tag_name: tagName,
            name: `LocalShift ${platform} v${version}`,
            body: releaseNotes || `LocalShift ${platform} release v${version}`,
            draft: false,
            prerelease: false,
        });

        // 2. Upload the APK as a release asset
        const ext = require('path').extname(req.file.originalname) || '.apk';
        const assetName = `localshift-${platform}-v${version}${ext}`;

        const { data: asset } = await octokit.rest.repos.uploadReleaseAsset({
            owner:      GITHUB_OWNER,
            repo:       GITHUB_REPO,
            release_id: release.id,
            name:       assetName,
            data:       req.file.buffer,          // buffer from multer memoryStorage
            headers: {
                'content-type':   req.file.mimetype || 'application/octet-stream',
                'content-length': req.file.buffer.length,
            },
        });

        const downloadUrl = asset.browser_download_url;

        // 3. Save to MongoDB
        await AppVersion_1.AppVersion.updateMany({ platform }, { isLatest: false });

        const newVersion = await AppVersion_1.AppVersion.create({
            version,
            platform,
            releaseNotes,
            downloadUrl,   // GitHub CDN URL — permanent, fast, no size limit
            isLatest: true,
            uploadedBy: req.user._id,
        });

        res.status(201).json(newVersion);
    } catch (error) {
        console.error('uploadAppVersion error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};
exports.uploadAppVersion = uploadAppVersion;

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
