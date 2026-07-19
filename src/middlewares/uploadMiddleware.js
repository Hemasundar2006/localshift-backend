"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = exports.uploadAppFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");

// ─── Cloudinary config ────────────────────────────────────────────────────────
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Local disk storage (resume / avatar – small files) ──────────────────────
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});

// ─── Memory storage (appFile – goes straight to Cloudinary) ──────────────────
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
    } else {
        cb(new Error('Unknown field name'), false);
    }
};

// ─── Multer instances ─────────────────────────────────────────────────────────
// For resume / avatar (disk)
exports.upload = (0, multer_1.default)({
    storage: diskStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB for pdfs/images
});

// For appFile (memory → Cloudinary)
exports.uploadAppFile = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 } // 200 MB for APKs
});

// ─── Cloudinary upload helper ─────────────────────────────────────────────────
/**
 * Upload a buffer (from multer memoryStorage) to Cloudinary.
 * Returns the secure URL.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @returns {Promise<string>} secure_url
 */
const uploadToCloudinary = (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        const ext = path_1.default.extname(originalName).replace('.', '');
        const publicId = `localshift-apks/${Date.now()}-${path_1.default.basename(originalName, '.' + ext)}`;

        const uploadStream = cloudinary_1.v2.uploader.upload_stream(
            {
                resource_type: 'raw',   // raw = non-image/video files (APK, PDF, etc.)
                public_id: publicId,
                format: ext,
                use_filename: true,
                unique_filename: false,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );

        const readableStream = new stream_1.Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
