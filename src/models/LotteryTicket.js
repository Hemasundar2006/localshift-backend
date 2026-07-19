"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LotteryTicket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const lotteryTicketSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    ticketNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'won', 'lost'], default: 'active' },
    drawDate: { type: Date }
}, {
    timestamps: true
});

exports.LotteryTicket = mongoose_1.default.model('LotteryTicket', lotteryTicketSchema);
