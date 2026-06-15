"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaymentSignature = exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
// Initialize Razorpay instance
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
/**
 * Create a new Razorpay order
 * @param amount - Amount in standard currency unit (e.g., INR)
 * @param receipt - Unique receipt ID
 * @param currency - Currency code (default: INR)
 */
const createOrder = async (amount, receipt, currency = 'INR') => {
    const options = {
        amount: amount * 100, // Razorpay expects amount in smallest currency unit (paise)
        currency,
        receipt,
    };
    try {
        const order = await razorpay.orders.create(options);
        return order;
    }
    catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw error;
    }
};
exports.createOrder = createOrder;
/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay Order ID
 * @param paymentId - Razorpay Payment ID
 * @param signature - Razorpay Signature sent from frontend
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret)
        throw new Error('Razorpay secret not configured');
    const generatedSignature = crypto_1.default
        .createHmac('sha256', secret)
        .update(orderId + '|' + paymentId)
        .digest('hex');
    return generatedSignature === signature;
};
exports.verifyPaymentSignature = verifyPaymentSignature;
exports.default = razorpay;
//# sourceMappingURL=razorpay.js.map