"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createPaymentOrder = void 0;
const razorpay_1 = require("../services/razorpay");
const createPaymentOrder = async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        if (!amount || !receipt) {
            res.status(400).json({ error: 'Amount and receipt are required' });
            return;
        }
        const order = await (0, razorpay_1.createOrder)(amount, receipt);
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
};
exports.createPaymentOrder = createPaymentOrder;
const verifyPayment = (req, res) => {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
        res.status(400).json({ error: 'orderId, paymentId, and signature are required' });
        return;
    }
    try {
        const isValid = (0, razorpay_1.verifyPaymentSignature)(orderId, paymentId, signature);
        if (isValid) {
            res.json({ success: true, message: 'Payment verified successfully' });
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=paymentController.js.map