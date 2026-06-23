"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const messageSchema = new mongoose_1.default.Schema({
    senderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
}, {
    _id: true,
    timestamps: true
});

const chatSchema = new mongoose_1.default.Schema({
    seekerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    employerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['locked', 'pending', 'accepted'], default: 'locked' },
    lastActive: { type: String, default: 'Online' },
    isTyping: { type: Boolean, default: false },
    messages: [messageSchema]
}, {
    timestamps: true
});

exports.Chat = mongoose_1.default.model('Chat', chatSchema);
