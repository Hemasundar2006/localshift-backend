import Razorpay from 'razorpay';
declare const razorpay: Razorpay;
/**
 * Create a new Razorpay order
 * @param amount - Amount in standard currency unit (e.g., INR)
 * @param receipt - Unique receipt ID
 * @param currency - Currency code (default: INR)
 */
export declare const createOrder: (amount: number, receipt: string, currency?: string) => Promise<import("razorpay/dist/types/orders").Orders.RazorpayOrder>;
/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay Order ID
 * @param paymentId - Razorpay Payment ID
 * @param signature - Razorpay Signature sent from frontend
 */
export declare const verifyPaymentSignature: (orderId: string, paymentId: string, signature: string) => boolean;
export default razorpay;
//# sourceMappingURL=razorpay.d.ts.map