"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAppVersions = exports.getLatestAppVersions = exports.uploadAppChunk = void 0;
const AppVersion_1 = require("../models/AppVersion");
const rest_1 = require("@octokit/rest");
const fs_1 = require("fs");
const path_1 = require("path");

const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO  = process.env.GITHUB_REPO;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// ─── POST /api/app-versions/upload-chunk ──────────────────────────────────────
// Receives chunks of the APK to bypass Cloudflare 100MB limit and Render timeouts.
// Stitches chunks, uploads to GitHub Releases, and saves to MongoDB.
const uploadAppChunk = async (req, res) => {
    try {
        const { uploadId, chunkIndex, totalChunks, originalName, version, platform, releaseNotes } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Chunk file missing' });
        }

        const tempDir = (0, path_1.join)(__dirname, '../../temp-uploads');
        if (!(0, fs_1.existsSync)(tempDir)) {
            (0, fs_1.mkdirSync)(tempDir, { recursive: true });
        }

        const chunkPath = (0, path_1.join)(tempDir, `${uploadId}-${chunkIndex}`);
        (0, fs_1.writeFileSync)(chunkPath, req.file.buffer);

        // If this is the last chunk, stitch and upload to GitHub
        if (parseInt(chunkIndex) === parseInt(totalChunks) - 1) {
            const ext = (0, path_1.extname)(originalName) || '.apk';
            const finalFilePath = (0, path_1.join)(tempDir, `${uploadId}${ext}`);
            
            const writeStream = (0, fs_1.createWriteStream)(finalFilePath);
            
            for (let i = 0; i < parseInt(totalChunks); i++) {
                const currentChunkPath = (0, path_1.join)(tempDir, `${uploadId}-${i}`);
                const data = (0, fs_1.readFileSync)(currentChunkPath);
                writeStream.write(data);
                (0, fs_1.unlinkSync)(currentChunkPath);
            }
            writeStream.end();

            writeStream.on('finish', async () => {
                try {
                    const fileBuffer = (0, fs_1.readFileSync)(finalFilePath);
                    const octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
                    const tagName = `v${version}-${platform}-${Date.now()}`;

                    // 1. Create a GitHub Release
                    const { data: release } = await octokit.rest.repos.createRelease({
                        owner: GITHUB_OWNER,
                        repo: GITHUB_REPO,
                        tag_name: tagName,
                        name: `LocalShift ${platform} v${version}`,
                        body: releaseNotes || `LocalShift ${platform} release v${version}`,
                        draft: false,
                        prerelease: false,
                    });

                    // 2. Upload the APK as a release asset
                    const assetName = `localshift-${platform}-v${version}${ext}`;
                    const { data: asset } = await octokit.rest.repos.uploadReleaseAsset({
                        owner: GITHUB_OWNER,
                        repo: GITHUB_REPO,
                        release_id: release.id,
                        name: assetName,
                        data: fileBuffer,
                        headers: {
                            'content-type': 'application/octet-stream',
                            'content-length': fileBuffer.length,
                        },
                    });

                    // Cleanup temp file
                    if ((0, fs_1.existsSync)(finalFilePath)) (0, fs_1.unlinkSync)(finalFilePath);

                    // 3. Save to MongoDB
                    await AppVersion_1.AppVersion.updateMany({ platform }, { isLatest: false });
                    const newVersion = await AppVersion_1.AppVersion.create({
                        version,
                        platform,
                        releaseNotes,
                        downloadUrl: asset.browser_download_url,
                        isLatest: true,
                        uploadedBy: req.user._id,
                    });

                    return res.status(201).json(newVersion);
                } catch (githubErr) {
                    console.error('GitHub upload error:', githubErr);
                    if ((0, fs_1.existsSync)(finalFilePath)) (0, fs_1.unlinkSync)(finalFilePath);
                    return res.status(500).json({ message: 'GitHub upload failed', error: githubErr.message });
                }
            });
            
            writeStream.on('error', (err) => {
                console.error('Stitching error:', err);
                return res.status(500).json({ message: 'File stitching failed', error: err.message });
            });

        } else {
            // Not the last chunk
            return res.json({ message: `Chunk ${chunkIndex} uploaded successfully` });
        }
    } catch (error) {
        console.error('uploadAppChunk error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};
exports.uploadAppChunk = uploadAppChunk;

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
