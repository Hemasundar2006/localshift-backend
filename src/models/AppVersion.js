"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppVersion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appVersionSchema = new mongoose_1.default.Schema({
    version: { type: String, required: true },
    platform: { type: String, enum: ['android', 'ios'], required: true },
    releaseNotes: { type: String },
    downloadUrl: { type: String, required: true },
    isLatest: { type: Boolean, default: false },
    uploadedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});
exports.AppVersion = mongoose_1.default.model('AppVersion', appVersionSchema);
