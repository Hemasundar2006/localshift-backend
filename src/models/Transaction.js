"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));

const transactionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['earn', 'withdraw'], required: true },
    amount: { type: Number, required: true }, // coins
    rupees: { type: Number }, // INR value, primarily for withdrawals
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'success'], default: 'success' },
    description: { type: String, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'Paytm', 'Bank'] },
    paymentDetails: { type: String }
}, {
    timestamps: true
});

exports.Transaction = mongoose_1.default.model('Transaction', transactionSchema);
