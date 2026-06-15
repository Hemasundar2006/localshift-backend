"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Send an SMS via Textbee
 * @param to - Recipient phone number (include country code, e.g., +91XXXXXXXXXX)
 * @param message - The SMS message content
 */
const sendSMS = async (to, message) => {
    const apiKey = process.env.TEXTBEE_API_KEY;
    const deviceId = process.env.TEXTBEE_DEVICE_ID;
    if (!apiKey || !deviceId) {
        throw new Error('Textbee credentials are not configured in environment variables.');
    }
    try {
        const response = await axios_1.default.post('https://api.textbee.dev/api/v1/gateway/devices/send-sms', {
            deviceId,
            receivers: [to], // Textbee accepts 'receivers' array
            smsBody: message
        }, {
            headers: {
                'x-api-key': apiKey
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('Error sending SMS via Textbee:', error);
        throw error;
    }
};
exports.sendSMS = sendSMS;
//# sourceMappingURL=textbee.js.map