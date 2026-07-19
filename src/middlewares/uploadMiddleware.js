"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatarToCloudinary = exports.uploadResumeToCloudinary = exports.uploadToCloudinary = exports.uploadAppFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");

// ─── Cloudinary config ────────────────────────────────────────────────────────
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Memory storage (all files — no disk touch) ───────────────────────────────
const memoryStorage = multer_1.default.memoryStorage();

// ─── File filter ─────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'resume') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for resume'), false);
        }
    } else if (file.fieldname === 'avatar') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile picture'), false);
        }
    } else if (file.fieldname === 'appFile') {
        const allowedExts = ['.apk', '.ipa', '.aab'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only .apk, .aab, or .ipa files are allowed for app uploads'), false);
        }
    } else if (file.fieldname === 'chunk') {
        // Chunks are sent as application/octet-stream, just accept them
        cb(null, true);
    } else {
        cb(new Error('Unknown field name'), false);
    }
};

// ─── Multer instances (all use memoryStorage) ─────────────────────────────────
// For resume / avatar (memory → Cloudinary)
exports.upload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB for PDFs/images
});

// For appFile (memory → GitHub Releases)
exports.uploadAppFile = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 } // 200 MB for APKs
});

// ─── Cloudinary stream helper ─────────────────────────────────────────────────
const streamToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
        const readable = new stream_1.Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(uploadStream);
    });
};

// ─── Avatar upload → Cloudinary (image) ──────────────────────────────────────
/**
 * Upload a profile image buffer to Cloudinary.
 * Auto-transforms: resize to 400x400, face-crop, webp format.
 * @param {Buffer} buffer
 * @param {string} userId  - used as public_id so old avatar is auto-replaced
 * @returns {Promise<string>} secure_url
 */
const uploadAvatarToCloudinary = (buffer, userId) => {
    return streamToCloudinary(buffer, {
        resource_type: 'image',
        folder: 'localshift-avatars',
        public_id: `user-${userId}`,      // same public_id = replaces old avatar
        overwrite: true,
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { fetch_format: 'auto', quality: 'auto' },
        ],
    });
};
exports.uploadAvatarToCloudinary = uploadAvatarToCloudinary;

// ─── Resume upload → Cloudinary (raw PDF) ────────────────────────────────────
/**
 * Upload a PDF resume buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} userId
 * @returns {Promise<string>} secure_url
 */
const uploadResumeToCloudinary = (buffer, originalName, userId) => {
    const baseName = path_1.default.basename(originalName, path_1.default.extname(originalName));
    return streamToCloudinary(buffer, {
        resource_type: 'raw',
        folder: 'localshift-resumes',
        public_id: `resume-${userId}-${baseName}`,
        format: 'pdf',
        overwrite: true,
    });
};
exports.uploadResumeToCloudinary = uploadResumeToCloudinary;

// ─── Generic raw upload (kept for backward compat) ───────────────────────────
const uploadToCloudinary = (buffer, originalName) => {
    const ext = path_1.default.extname(originalName).replace('.', '');
    const publicId = `localshift-misc/${Date.now()}-${path_1.default.basename(originalName, '.' + ext)}`;
    return streamToCloudinary(buffer, {
        resource_type: 'raw',
        public_id: publicId,
        format: ext,
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
