"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const activityLogSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }, // Optional, as some events might be system-wide
    action: { type: String, required: true }, // e.g., 'USER_LOGIN', 'JOB_CREATED'
    description: { type: String, required: true },
    metadata: { type: mongoose_1.default.Schema.Types.Mixed }, // Any extra info
    ipAddress: { type: String },
}, {
    timestamps: true
});
// Index for faster queries
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ user: 1 });

exports.ActivityLog = mongoose_1.default.model('ActivityLog', activityLogSchema);
