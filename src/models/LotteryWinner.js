"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LotteryWinner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const lotteryWinnerSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    mobileNumber: { type: String },
    ticketNumber: { type: String, required: true },
    prizeAmount: { type: Number, required: true },
    drawDate: { type: Date, default: Date.now }
}, {
    timestamps: true
});

exports.LotteryWinner = mongoose_1.default.model('LotteryWinner', lotteryWinnerSchema);
